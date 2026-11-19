import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!);
export async function POST(req:Request){
 const form=await req.formData();const tran_id=String(form.get("tran_id")||"");const val_id=String(form.get("val_id")||"");
 if(!tran_id||!val_id)return NextResponse.redirect(new URL("/?payment=failed",process.env.NEXT_PUBLIC_SITE_URL));
 const live=process.env.SSLCOMMERZ_IS_LIVE==="true";const verifyUrl=live?"https://securepay.sslcommerz.com/validator/api/validationserverAPI.php":"https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php";
 const q=new URLSearchParams({val_id,store_id:process.env.SSLCOMMERZ_STORE_ID||"",store_passwd:process.env.SSLCOMMERZ_STORE_PASSWORD||"",format:"json"});
 const vr=await fetch(`${verifyUrl}?${q}`);const v=await vr.json();
 if(v.status==="VALID"||v.status==="VALIDATED"){
   await db.from("orders").update({payment_status:"paid",status:"confirmed",transaction_id:val_id}).eq("id",tran_id);
   return NextResponse.redirect(new URL("/?payment=success",process.env.NEXT_PUBLIC_SITE_URL));
 }
 await db.from("orders").update({payment_status:"failed"}).eq("id",tran_id);
 return NextResponse.redirect(new URL("/?payment=failed",process.env.NEXT_PUBLIC_SITE_URL));
}
export async function GET(req:Request){const u=new URL(req.url);return NextResponse.redirect(new URL(`/?payment=${u.searchParams.get("status")||"failed"}`,process.env.NEXT_PUBLIC_SITE_URL))}
