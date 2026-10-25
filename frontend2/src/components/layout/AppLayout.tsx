import React from "react";
import HomeNavbar from "../home/HomeNavbar";
import AppFooter from "./AppFooter";

type AppLayoutProps = {
  children: React.ReactNode;
};

export const AppLayout = ({ children }: AppLayoutProps): React.JSX.Element => {
  return (
    <div className="home-page min-h-screen bg-home-bg text-home-body normal-case flex flex-col">
      <HomeNavbar />
      <div className="relative flex-1">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-home-accent-soft via-home-bg to-transparent"
        />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          {children}
        </div>
      </div>
      <AppFooter />
    </div>
  );
};

export default AppLayout;
