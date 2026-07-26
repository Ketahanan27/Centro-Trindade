import Sidebar from "./sidebar";
import Topbar from "./topbar";
import "../../assets/styles/dashboard/dashboard.css";

function DashboardLayout({ children }) {
  return (
    <div className="dashboard">
      <Sidebar />
      <main className="content">
        <Topbar />
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
