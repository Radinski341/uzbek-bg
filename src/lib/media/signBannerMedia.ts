import { getFileUrl } from "@/lib/aws/s3Functions";

export async function signBannerMedia(
  template: { fields: Array<{ key: string; type: string; isArray: boolean }> },
  data: any
) {
  const result: any = { ...(data || {}) };

  for (const f of template.fields || []) {
    if (f.type !== "IMAGE") continue;
    const v = result[f.key];
    if (!v) continue;

    if (f.isArray && Array.isArray(v)) {
      result[f.key] = await Promise.all(
        v.map((key: string) => getFileUrl(key))
      );
    } else if (!f.isArray && typeof v === "string") {
      result[f.key] = await getFileUrl(v);
    }
  }

  return result;
}
