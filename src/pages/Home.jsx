import Layout from "../components/Layout";

import Hero from "../components/home/hero";
import VideoSection from "../components/home/videosection";
import Gallery from "../components/home/gallery";

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