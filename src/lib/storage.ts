import { createSupabaseServerClient } from "@/lib/supabase/server";

const BUCKET_NAME = "visita-images";

export async function uploadVisitaImage(
	file: File | Blob,
	trabajoId: string,
	fieldName: string,
): Promise<string> {
	const supabase = await createSupabaseServerClient();
	const ext = file instanceof File ? file.name.split(".").pop() || "jpg" : "jpg";
	const timestamp = Date.now();
	const path = `${trabajoId}/${fieldName}-${timestamp}.${ext}`;

	const { error } = await supabase.storage
		.from(BUCKET_NAME)
		.upload(path, file, {
			cacheControl: "3600",
			upsert: false,
			contentType: file instanceof File ? file.type : "image/jpeg",
		});

	if (error) {
		throw new Error(`Failed to upload image: ${error.message}`);
	}

	const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
	return data.publicUrl;
}
