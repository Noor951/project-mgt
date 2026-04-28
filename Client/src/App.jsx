import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";

import Layout from "./pages/Layout";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Team from "./pages/Team";
import ProjectDetails from "./pages/ProjectDetails";
import TaskDetails from "./pages/TaskDetails";

const App = () => {
    return (
        <>
            <Toaster />
            <Routes>
                {/* 1. Protected Routes: Only visible if Signed In */}
                <Route
                    path="/"
                    element={
                        <>
                            <SignedIn>
                                <Layout />
                            </SignedIn>
                            <SignedOut>
                                <RedirectToSignIn />
                            </SignedOut>
                        </>
                    }
                >
                    <Route index element={<Dashboard />} />
                    <Route path="team" element={<Team />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="projectsDetail" element={<ProjectDetails />} />
                    <Route path="taskDetails" element={<TaskDetails />} />
                </Route>

                {/* 2. Optional: Add a specific public route if needed */}
                {/* <Route path="/about" element={<AboutPage />} /> */}
            </Routes>
        </>
    );
};

export default App;