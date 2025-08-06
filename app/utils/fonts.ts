import { Manrope } from "next/font/google";
import localFont from "next/font/local";

export const krylon = localFont({
  src: "../../public/fonts/Krylon-Regular.woff2",
  display: "swap",
  variable: "--font-krylon",
});

export const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});
