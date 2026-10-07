import Layout from "../../components/Layout";

import Hero from "./components/Hero";
import VideoSection from "./components/VideoSection";
import Gallery from "./components/Gallery";

function Home() {
  return (
    <Layout>
      <div className="container">
        <Hero />
        <VideoSection />
        <Gallery />
      </div>
    </Layout>
  );
}

export default Home;
