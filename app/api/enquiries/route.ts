import { handleEnquiryPost } from "./handler.ts";

export async function POST(request: Request) {
  return handleEnquiryPost(request);
}
