# Deshi Basket — দেশি বাস্কেট

এটি Next.js + Supabase ভিত্তিক ই-কমার্স ওয়েবসাইটের সোর্স প্রজেক্ট।

## যা তৈরি আছে
- মোবাইল-ফ্রেন্ডলি স্টোরফ্রন্ট ও পণ্যের তালিকা
- কার্ট ও চেকআউট: নাম, বাংলাদেশি ফোন নম্বর, ঠিকানা
- ডেলিভারি চার্জ ইনপুট
- অ্যাডমিন ইমেইল/পাসওয়ার্ড লগইন (Supabase Auth)
- পণ্য যোগ ও ছবি আপলোড, পণ্য মুছে ফেলা
- অর্ডার তালিকা ও স্ট্যাটাস আপডেট
- SSLCommerz sandbox/live payment session এবং server-side validation callback
- COD অপশন

## চালু করার ধাপ
1. Supabase-এ একটি Free project তৈরি করুন।
2. SQL Editor-এ `supabase-schema.sql` ফাইলের সব SQL রান করুন।
3. Storage-এ `products` নামে bucket তৈরি করে Public করুন।
4. Authentication → Users থেকে আপনার নিজের Admin email/password দিয়ে user তৈরি করুন। পাসওয়ার্ড কাউকে দেবেন না।
5. Project Settings → API থেকে Project URL, anon key ও service_role key নিন।
6. `.env.example` কপি করে `.env.local` বানিয়ে Supabase তথ্য বসান। `SUPABASE_SERVICE_ROLE_KEY` কখনো `NEXT_PUBLIC_` নামে রাখবেন না এবং কারও সঙ্গে শেয়ার করবেন না।
7. SSLCommerz merchant account অনুমোদন নিয়ে Store ID ও Store Password নিন। প্রথমে sandbox credentials ব্যবহার করুন। বিকাশ ও নগদ gateway-এ চালু আছে কি না SSLCommerz merchant dashboard-এ নিশ্চিত করুন।
8. `NEXT_PUBLIC_SITE_URL`-এ আপনার deploy করা website URL বসান।
9. লোকাল টেস্ট: `npm install` তারপর `npm run dev`।
10. GitHub-এ project push করে Vercel-এ import করুন। Environment Variables-এ `.env.local`-এর মান বসিয়ে Deploy দিন।

## গুরুত্বপূর্ণ নিরাপত্তা ও লাইভ-চালুর আগে
- Gateway transaction callback ও IPN flow-টি আপনার merchant credentials দিয়ে sandbox-এ end-to-end পরীক্ষা করুন।
- অর্ডারের amount server-side-এ database থেকে পুনরায় হিসাব করুন; এই starter checkout request-এ client-sent amount নেয়, তাই লাইভে যাওয়ার আগে API-তে product prices database থেকে যাচাই করে total হিসাব করা আবশ্যক।
- Admin role policy-তে production-এ নির্দিষ্ট admin user/role সীমাবদ্ধ করুন; বর্তমানে authenticated users-এর policy সরল starter configuration।
- Public storage bucket-এ upload permission production-এ authenticated admin-এ সীমিত করুন।
- ডেলিভারি চার্জ এখন checkout-এ দেওয়া যায়; স্থায়ী জেলা/এলাকা-ভিত্তিক চার্জ সেটিংসের জন্য পরবর্তী ধাপে settings table ও admin UI যুক্ত করা উচিত।
- SSLCommerz payment না হলে order failed/cancelled হিসেবে যাচাই করুন। শুধুমাত্র browser redirect-কে payment proof হিসেবে বিশ্বাস করবেন না।
- বিকাশ/নগদ নম্বর 01724790104 ম্যানুয়াল Send Money হিসেবে চালু করতে চাইলে আলাদা payment instructions, transaction ID collection ও admin verification workflow যুক্ত করতে হবে; এটি gateway payment-এর থেকে আলাদা।
