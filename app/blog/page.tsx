import { permanentRedirect } from "next/navigation";
export default function BlogRedirect() {
  permanentRedirect("/zh-CN/blog");
}
