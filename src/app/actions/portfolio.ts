"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { type UserProfile, type CaseStudy, type CaseStudyBlock } from "@/lib/portfolio";

// Helper functions for mapping snake_case db rows to camelCase JS models and vice-versa
function toProfileCamel(row: any): UserProfile {
  return {
    userId: row.id,
    username: row.username,
    displayName: row.display_name,
    headline: row.headline ?? "",
    bio: row.bio ?? "",
    avatarUrl: row.avatar_url ?? "",
    location: row.location ?? "",
    skills: row.skills ?? [],
    links: row.links ?? [],
    contactEmail: row.contact_email ?? "",
    published: row.published ?? false,
  };
}

function toProfileSnake(camel: Partial<UserProfile>) {
  const result: any = {};
  if (camel.username !== undefined) result.username = camel.username;
  if (camel.displayName !== undefined) result.display_name = camel.displayName;
  if (camel.headline !== undefined) result.headline = camel.headline;
  if (camel.bio !== undefined) result.bio = camel.bio;
  if (camel.avatarUrl !== undefined) result.avatar_url = camel.avatarUrl;
  if (camel.location !== undefined) result.location = camel.location;
  if (camel.skills !== undefined) result.skills = camel.skills;
  if (camel.links !== undefined) result.links = camel.links;
  if (camel.contactEmail !== undefined) result.contact_email = camel.contactEmail;
  if (camel.published !== undefined) result.published = camel.published;
  return result;
}

function toCaseCamel(row: any): CaseStudy {
  return {
    id: row.id,
    userId: row.user_id,
    slug: row.slug,
    title: row.title,
    summary: row.summary ?? "",
    role: row.role ?? "",
    company: row.company ?? "",
    timeframe: row.timeframe ?? "",
    coverImageUrl: row.cover_image_url ?? "",
    published: row.published ?? false,
    sortOrder: row.sort_order ?? 0,
  };
}

function toCaseSnake(camel: Partial<CaseStudy>) {
  const result: any = {};
  if (camel.slug !== undefined) result.slug = camel.slug;
  if (camel.title !== undefined) result.title = camel.title;
  if (camel.summary !== undefined) result.summary = camel.summary;
  if (camel.role !== undefined) result.role = camel.role;
  if (camel.company !== undefined) result.company = camel.company;
  if (camel.timeframe !== undefined) result.timeframe = camel.timeframe;
  if (camel.coverImageUrl !== undefined) result.cover_image_url = camel.coverImageUrl;
  if (camel.published !== undefined) result.published = camel.published;
  if (camel.sortOrder !== undefined) result.sort_order = camel.sortOrder;
  return result;
}

function toBlockCamel(row: any): CaseStudyBlock {
  return {
    id: row.id,
    caseStudyId: row.case_study_id,
    type: row.type,
    title: row.title,
    content: row.content ?? "",
    sortOrder: row.sort_order ?? 0,
  };
}

function toBlockSnake(camel: Partial<CaseStudyBlock>) {
  const result: any = {};
  if (camel.caseStudyId !== undefined) result.case_study_id = camel.caseStudyId;
  if (camel.type !== undefined) result.type = camel.type;
  if (camel.title !== undefined) result.title = camel.title;
  if (camel.content !== undefined) result.content = camel.content;
  if (camel.sortOrder !== undefined) result.sort_order = camel.sortOrder;
  return result;
}

function toAttachmentCamel(row: any) {
  return {
    id: row.id,
    caseStudyId: row.case_study_id,
    fileName: row.file_name,
    fileType: row.file_type,
    fileUrl: row.file_url,
    fileSize: Number(row.file_size),
    createdAt: row.created_at,
  };
}

// MUTATION SERVER ACTIONS

export async function saveProfile(data: Partial<UserProfile>) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const snakeData = toProfileSnake(data);

  const { data: row, error } = await supabase
    .from("profiles")
    .update(snakeData)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Revalidate public portfolio pages
  if (row.username) {
    revalidatePath(`/p/${row.username}`);
  }

  return { success: true, profile: toProfileCamel(row) };
}

export async function createCaseStudy(slug: string, title: string) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Calculate sort order
  const { data: countData } = await supabase
    .from("case_studies")
    .select("id")
    .eq("user_id", user.id);
  const sortOrder = (countData?.length ?? 0) + 1;

  const { data: row, error } = await supabase
    .from("case_studies")
    .insert({
      user_id: user.id,
      slug,
      title,
      summary: "Summarize the customer problem, your product decision, and the measurable result.",
      role: "Product Manager",
      company: "Company or product",
      timeframe: "2026",
      published: false,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  const createdCase = toCaseCamel(row);

  // Initialize guided story blocks for the new case study
  const defaultBlocks = ["problem", "research", "strategy", "execution", "metrics", "learnings"];
  const blocksToInsert = defaultBlocks.map((type, index) => ({
    case_study_id: createdCase.id,
    type,
    title: type.charAt(0).toUpperCase() + type.slice(1),
    content: "",
    sort_order: index + 1,
  }));

  const { data: blockRows, error: blockError } = await supabase
    .from("case_study_blocks")
    .insert(blocksToInsert)
    .select();

  if (blockError) {
    return { error: `Case study created but blocks failed: ${blockError.message}` };
  }

  return {
    success: true,
    caseStudy: createdCase,
    blocks: blockRows.map(toBlockCamel),
  };
}

export async function updateCaseStudy(caseStudyId: string, fields: Partial<CaseStudy>) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const snakeData = toCaseSnake(fields);

  const { data: row, error } = await supabase
    .from("case_studies")
    .update(snakeData)
    .eq("id", caseStudyId)
    .eq("user_id", user.id) // security check
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Retrieve username for cache revalidation
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (profile?.username) {
    revalidatePath(`/p/${profile.username}`);
    revalidatePath(`/p/${profile.username}/${row.slug}`);
  }

  return { success: true, caseStudy: toCaseCamel(row) };
}

export async function deleteCaseStudy(caseStudyId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: row, error } = await supabase
    .from("case_studies")
    .delete()
    .eq("id", caseStudyId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (profile?.username) {
    revalidatePath(`/p/${profile.username}`);
  }

  return { success: true, caseStudyId };
}

export async function upsertCaseStudyBlock(block: Partial<CaseStudyBlock> & { id?: string; caseStudyId: string }) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Security verify that the user owns the case study
  const { data: csCheck } = await supabase
    .from("case_studies")
    .select("id")
    .eq("id", block.caseStudyId)
    .eq("user_id", user.id)
    .single();

  if (!csCheck) return { error: "Unauthorized to update this case study" };

  const snakeData = toBlockSnake(block);

  let query;
  if (block.id) {
    query = supabase
      .from("case_study_blocks")
      .update(snakeData)
      .eq("id", block.id)
      .select()
      .single();
  } else {
    // Add default sort order
    if (snakeData.sort_order === undefined) {
      const { data: blocks } = await supabase
        .from("case_study_blocks")
        .select("id")
        .eq("case_study_id", block.caseStudyId);
      snakeData.sort_order = (blocks?.length ?? 0) + 1;
    }
    query = supabase
      .from("case_study_blocks")
      .insert(snakeData)
      .select()
      .single();
  }

  const { data: row, error } = await query;

  if (error) {
    return { error: error.message };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (profile?.username) {
    const { data: cs } = await supabase
      .from("case_studies")
      .select("slug")
      .eq("id", block.caseStudyId)
      .single();
    if (cs) {
      revalidatePath(`/p/${profile.username}/${cs.slug}`);
    }
  }

  return { success: true, block: toBlockCamel(row) };
}

export async function deleteCaseStudyBlock(blockId: string, caseStudyId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Security verify that the user owns the case study
  const { data: csCheck } = await supabase
    .from("case_studies")
    .select("id")
    .eq("id", caseStudyId)
    .eq("user_id", user.id)
    .single();

  if (!csCheck) return { error: "Unauthorized to delete from this case study" };

  const { error } = await supabase
    .from("case_study_blocks")
    .delete()
    .eq("id", blockId)
    .eq("case_study_id", caseStudyId);

  if (error) {
    return { error: error.message };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (profile?.username) {
    const { data: cs } = await supabase
      .from("case_studies")
      .select("slug")
      .eq("id", caseStudyId)
      .single();
    if (cs) {
      revalidatePath(`/p/${profile.username}/${cs.slug}`);
    }
  }

  return { success: true, blockId };
}

export async function uploadAttachment(caseStudyId: string, formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Security verify ownership of case study
  const { data: csCheck } = await supabase
    .from("case_studies")
    .select("id")
    .eq("id", caseStudyId)
    .eq("user_id", user.id)
    .single();

  if (!csCheck) return { error: "Unauthorized to add attachments" };

  const file = formData.get("file") as File;
  if (!file) return { error: "No file provided" };

  // Mime types check
  const acceptedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ];
  
  const fileExt = file.name.split(".").pop()?.toLowerCase();
  const allowedExtensions = ["pdf", "doc", "docx", "ppt", "pptx"];
  const isAllowedExt = fileExt ? allowedExtensions.includes(fileExt) : false;

  if (!acceptedTypes.includes(file.type) && !isAllowedExt) {
    return { error: "Invalid file type. Only PDF, Word, and PowerPoint are accepted." };
  }

  // Size check: 12MB limit
  if (file.size > 12 * 1024 * 1024) {
    return { error: "File exceeds size limit of 12 MB." };
  }

  const fileExt = file.name.split(".").pop();
  const filePath = `${user.id}/${caseStudyId}/${Date.now()}.${fileExt}`;
  const fileBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from("portfolio-attachments")
    .upload(filePath, fileBuffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return { error: `Storage upload failed: ${uploadError.message}` };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("portfolio-attachments").getPublicUrl(filePath);

  // Insert attachment info into attachments table
  const { data: row, error: dbError } = await supabase
    .from("attachments")
    .insert({
      case_study_id: caseStudyId,
      file_name: file.name,
      file_type: file.type,
      file_url: publicUrl,
      file_size: file.size,
    })
    .select()
    .single();

  if (dbError) {
    return { error: `Registered file upload but failed saving to database: ${dbError.message}` };
  }

  // Revalidate
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (profile?.username) {
    const { data: cs } = await supabase
      .from("case_studies")
      .select("slug")
      .eq("id", caseStudyId)
      .single();
    if (cs) {
      revalidatePath(`/p/${profile.username}/${cs.slug}`);
    }
  }

  return { success: true, attachment: toAttachmentCamel(row) };
}

// QUERY / FETCHING APIs (For Server-Side Rendering)

export async function fetchPublicPortfolio(username: string) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase not configured" };

  // Fetch published profile
  const { data: profileRow, error: pError } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .eq("published", true)
    .single();

  if (pError || !profileRow) {
    return { error: "Profile not found or unpublished" };
  }

  const profile = toProfileCamel(profileRow);

  // Fetch published case studies
  const { data: caseRows, error: csError } = await supabase
    .from("case_studies")
    .select("*")
    .eq("user_id", profile.userId)
    .eq("published", true)
    .order("sort_order", { ascending: true });

  const caseStudies = (caseRows ?? []).map(toCaseCamel);

  // Fetch attachments for these studies to count them
  const caseIds = caseStudies.map((cs) => cs.id);
  let attachments: any[] = [];
  if (caseIds.length > 0) {
    const { data: attRows } = await supabase
      .from("attachments")
      .select("*")
      .in("case_study_id", caseIds);
    attachments = (attRows ?? []).map(toAttachmentCamel);
  }

  return { profile, caseStudies, attachments };
}

export async function fetchPublicCaseStudy(username: string, slug: string) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase not configured" };

  // Fetch published profile
  const { data: profileRow, error: pError } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .eq("published", true)
    .single();

  if (pError || !profileRow) {
    return { error: "Profile not found or unpublished" };
  }

  const profile = toProfileCamel(profileRow);

  // Fetch specific case study
  const { data: csRow, error: csError } = await supabase
    .from("case_studies")
    .select("*")
    .eq("user_id", profile.userId)
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (csError || !csRow) {
    return { error: "Case study not found or unpublished" };
  }

  const caseStudy = toCaseCamel(csRow);

  // Fetch blocks
  const { data: blockRows } = await supabase
    .from("case_study_blocks")
    .select("*")
    .eq("case_study_id", caseStudy.id)
    .order("sort_order", { ascending: true });

  const blocks = (blockRows ?? []).map(toBlockCamel);

  // Fetch attachments
  const { data: attRows } = await supabase
    .from("attachments")
    .select("*")
    .eq("case_study_id", caseStudy.id);

  const attachments = (attRows ?? []).map(toAttachmentCamel);

  return { profile, caseStudy, blocks, attachments };
}

// Fetch complete workspace data for dashboard
export async function fetchUserWorkspace() {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Fetch profile
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profileRow) return { error: "No profile found" };
  const profile = toProfileCamel(profileRow);

  // Fetch case studies
  const { data: caseRows } = await supabase
    .from("case_studies")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true });

  const caseStudies = (caseRows ?? []).map(toCaseCamel);

  // Fetch blocks
  const caseIds = caseStudies.map((cs) => cs.id);
  let blocks: CaseStudyBlock[] = [];
  let attachments: any[] = [];

  if (caseIds.length > 0) {
    const { data: blockRows } = await supabase
      .from("case_study_blocks")
      .select("*")
      .in("case_study_id", caseIds)
      .order("sort_order", { ascending: true });
    blocks = (blockRows ?? []).map(toBlockCamel);

    const { data: attRows } = await supabase
      .from("attachments")
      .select("*")
      .in("case_study_id", caseIds);
    attachments = (attRows ?? []).map(toAttachmentCamel);
  }

  return { profile, caseStudies, blocks, attachments };
}
