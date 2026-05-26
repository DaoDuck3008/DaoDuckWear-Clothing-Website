"use client";

import { googleLogin } from "@/apis/auth.api";
import { GoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { handleApiError } from "@/utils/error.util";

export default function GoogleLoginButton() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return (
    <GoogleLogin
      containerProps={{
        className:
          "w-full flex items-center cursor-pointer justify-center gap-3 bg-white  text-slate-700  font-bold py-3 my-2 px-4 rounded-lg transition-all duration-200 h-12",
      }}
      onSuccess={async (credentialResponse) => {
        try {
          const result = await googleLogin(credentialResponse.credential!);

          const { accessToken, user } = result.data;
          setAuth(accessToken, user);
          
          toast.success("Đăng nhập thành công!");
          router.replace("/");
        } catch (error: any) {
          console.error("Google login failed: ", error);
          handleApiError(error, "Đăng nhập thất bại!");
        }
      }}
    />
  );
}
