import Banner from "@/features/Home/component/Banner";
import Navbar from "@/components/sheard/website/Navbar";
import Footer from "@/components/sheard/website/Footer";
import VerifyAnyDevices from "@/features/Home/component/VerifyAnyDevices";

export default function Home() {
  return (
    <main>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <Banner />
      </div>
      <VerifyAnyDevices />
      <Footer />
    </main>
  );
}
