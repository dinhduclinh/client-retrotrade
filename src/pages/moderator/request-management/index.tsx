"use client";

import { useState } from "react";
import { ModeratorSidebar } from "@/components/ui/moderator/moderator-sidebar";
import { ModeratorHeader } from "@/components/ui/moderator/moderator-header";
import { OwnerRequestManagement } from "@/components/ui/moderator/ownerRequest/owner-request-management";

import { BlogManagementTable } from "@/components/ui/moderator/blog/blog-management-table";
import { CategoryManagementTable } from "@/components/ui/moderator/blog/category-management-table";
import { CommentManagementTable } from "@/components/ui/moderator/blog/comment-management-table";

export default function RequestManagementDashboard() {
  // Đã mở rộng kiểu để bao gồm tất cả các tab mà ModeratorSidebar hỗ trợ
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "requests"
    | "verification"
    | "blog"
    | "productManagement"
    | "messages"
    | "userManagement"
    | "dispute"
    | "complaints"
  >("requests");

  const [activeBlogTab, setActiveBlogTab] = useState<
    "posts" | "categories" | "comments" | "tags"
  >("posts");

  const handleBlogTabChange = (
    tab: "posts" | "categories" | "comments" | "tags"
  ) => {
    setActiveBlogTab(tab);
    setActiveTab("blog");
  };

  const renderContent = () => {
    if (activeTab === "blog") {
      switch (activeBlogTab) {
        case "posts":
          return <BlogManagementTable />;
        case "categories":
          return <CategoryManagementTable />;
        case "comments":
          return <CommentManagementTable />;
        case "tags":
          return <div className="text-gray-500">Quản lý Tags (sắp ra mắt)</div>;
        default:
          return <BlogManagementTable />;
      }
    }

    // Các tab khác tạm thời chỉ hiển thị OwnerRequestManagement
    // (Bạn có thể mở rộng sau khi tạo component tương ứng)
    switch (activeTab) {
      case "requests":
      case "productManagement":
      case "verification":
      case "dashboard":
      case "messages":
      case "userManagement":
      case "dispute":
      case "complaints":
        return <OwnerRequestManagement />;
      default:
        return <OwnerRequestManagement />;
    }
  };

  const getPageTitle = () => {
    if (activeTab === "blog") {
      switch (activeBlogTab) {
        case "posts":
          return "Quản lý bài viết";
        case "categories":
          return "Quản lý danh mục";
        case "comments":
          return "Quản lý bình luận";
        case "tags":
          return "Quản lý thẻ (Tags)";
        default:
          return "Quản lý bài viết";
      }
    }

    const titles: Record<typeof activeTab, string> = {
      dashboard: "Tổng quan Moderator",
      requests: "Yêu cầu kiểm duyệt",
      verification: "Xác minh tài khoản",
      productManagement: "Quản lý sản phẩm",
      messages: "Tin nhắn người dùng",
      userManagement: "Quản lý người dùng",
      dispute: "Xử lý tranh chấp",
      complaints: "Khiếu nại & Báo cáo",
      blog: "Quản lý Blog",
    };

    return titles[activeTab] || "Yêu cầu kiểm duyệt";
  };

  const getPageDescription = () => {
    if (activeTab === "blog") {
      switch (activeBlogTab) {
        case "posts":
          return "Tạo, chỉnh sửa và quản lý các bài viết trong hệ thống";
        case "categories":
          return "Quản lý các danh mục và phân loại bài viết";
        case "comments":
          return "Kiểm duyệt và quản lý bình luận từ người dùng";
        case "tags":
          return "Quản lý thẻ tag để phân loại nội dung";
        default:
          return "Tạo, chỉnh sửa và quản lý các bài viết trong hệ thống";
      }
    }

    const descriptions: Record<typeof activeTab, string> = {
      dashboard: "Theo dõi hoạt động và thống kê tổng quan",
      requests: "Duyệt và phê duyệt các yêu cầu từ người dùng",
      verification: "Xác minh thông tin KYC của người dùng",
      productManagement: "Quản lý sản phẩm chờ duyệt và sản phẩm vi phạm",
      messages: "Xem và xử lý tin nhắn giữa người dùng",
      userManagement: "Quản lý tài khoản người dùng (Renter/Owner)",
      dispute: "Giải quyết tranh chấp giữa Renter và Owner",
      complaints: "Tiếp nhận và xử lý khiếu nại, báo cáo vi phạm",
      blog: "Quản lý nội dung blog và cộng đồng",
    };

    return (
      descriptions[activeTab] || "Duyệt và phê duyệt các yêu cầu từ người dùng"
    );
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="relative z-10 flex">
        <ModeratorSidebar
          activeTab={activeTab}
          activeBlogTab={activeBlogTab}
          onTabChange={setActiveTab}
          onBlogTabChange={handleBlogTabChange}
        />

        <div className="flex-1 transition-all duration-300 moderator-content-area min-w-0 bg-gray-50">
          <ModeratorHeader />

          <main className="p-4 lg:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {getPageTitle()}
              </h2>
              <p className="text-gray-600">{getPageDescription()}</p>
            </div>

            <div className="mt-8">{renderContent()}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
