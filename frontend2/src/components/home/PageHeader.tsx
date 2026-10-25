import React from "react";

type PageHeaderProps = {
  label: string;
  title: string;
  description?: string;
  className?: string;
};

export const PageHeader = ({ label, title, description, className = "" }: PageHeaderProps): React.JSX.Element => (
  <div className={`mb-8 sm:mb-10 ${className}`}>
    <p className="ws-eyebrow mb-3">{label}</p>
    <h1 className="tw-page-title">{title}</h1>
    {description && <p className="tw-page-subtitle">{description}</p>}
  </div>
);

export default PageHeader;
