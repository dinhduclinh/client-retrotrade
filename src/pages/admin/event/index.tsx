"use client";

import { useEffect, useState } from "react";
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleEventActive,
  uploadFeatureImage,
  Event,
  DisplayType,
} from "@/services/event/event.api";
import {
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Calendar,
  Image as ImagePlus,
  Type,
  Settings,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const displayTypeOptions: {
  value: DisplayType;
  label: string;
  emoji: string;
}[] = [
  { value: "christmas-tree", label: "Cây thông Giáng sinh", emoji: "🎄" },
  { value: "peach-blossom", label: "Cây hoa đào", emoji: "🌸" },
  { value: "apricot-blossom", label: "Cây hoa mai vàng", emoji: "🌼" },
  { value: "both-tet-trees", label: "Cả hoa đào + hoa mai", emoji: "🌸🌼" },
  { value: "vietnam-flag", label: "Cờ Việt Nam", emoji: "⭐" },
  { value: "halloween-pumpkin", label: "Bí ngô Halloween", emoji: "🎃" },
  { value: "none", label: "Không hiển thị", emoji: "➖" },
];

const decorationEmojiOptions: string[] = [
  "🎄",
  "⭐",
  "🎁",
  "🔔",
  "❄️",
  "🌟",
  "🎅",
  "🌸",
  "🧧",
  "🎃",
  "❤️",
  "💛",
  "🟡",
  "🔴",
  "🟢",
  "🔵",
  "🎉",
  "✨",
  "🌺",
  "🌻",
  "🍁",
  "🍂",
  "🌙",
  "☀️",
  "🌈",
  "🦋",
  "🐉",
  "🧨",
  "💥",
];

const countdownTypeOptions: {
  value: "default" | "christmas" | "newyear" | "tet" | "national-day";
  label: string;
  emoji?: string;
}[] = [
  { value: "default", label: "Mặc định (theo tên sự kiện)" },
  { value: "christmas", label: "Giáng Sinh", emoji: "🎄" },
  { value: "newyear", label: "Tết Dương Lịch", emoji: "🎆" },
  { value: "tet", label: "Tết Nguyên Đán", emoji: "🧧" },
  { value: "national-day", label: "Quốc Khánh 2/9", emoji: "⭐" },
];

const generateSlug = (name: string): string => {
  if (!name) return "";
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export default function EventManagementPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState<"basic" | "content" | "effects">(
    "basic"
  );

  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    eventId: string | null;
    eventName: string | null;
  }>({
    isOpen: false,
    eventId: null,
    eventName: null,
  });

  const [formData, setFormData] = useState<Partial<Event>>({
    name: "",
    slug: "",
    startDate: "",
    endDate: "",
    isActive: true,
    theme: {
      snowfall: false,
      decorations: false,
      countdownEnabled: false,
      countdownTargetDate: "",
      countdownType: "default",
      decorationEmojis: [],
      cardTitle: "",
      cardMessage: "",
      badgeText: "",
      buttonText1: "Khám Phá Sản Phẩm",
      buttonLink1: "/products",
      buttonText2: "",
      buttonLink2: "",
      displayType: "christmas-tree",
      featureImageUrl: "",
    },
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await getAllEvents();
      setEvents(data);
    } catch {
      toast.error("Không thể tải danh sách sự kiện");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openModal = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        name: event.name,
        slug: event.slug,
        startDate: event.startDate.split("T")[0],
        endDate: event.endDate.split("T")[0],
        isActive: event.isActive,
        theme: {
          snowfall: event.theme.snowfall ?? false,
          decorations: event.theme.decorations ?? false,
          countdownEnabled: event.theme.countdownEnabled ?? false,
          countdownTargetDate: event.theme.countdownTargetDate
            ? new Date(
                new Date(event.theme.countdownTargetDate).getTime() +
                  7 * 60 * 60 * 1000
              )
                .toISOString()
                .slice(0, 16)
            : "",
          countdownType: event.theme.countdownType ?? "default",
          decorationEmojis: event.theme.decorationEmojis ?? [],
          cardTitle: event.theme.cardTitle ?? "",
          cardMessage: event.theme.cardMessage ?? "",
          badgeText: event.theme.badgeText ?? "",
          buttonText1: event.theme.buttonText1 ?? "Khám Phá Sản Phẩm",
          buttonLink1: event.theme.buttonLink1 ?? "/products",
          buttonText2: event.theme.buttonText2 ?? "",
          buttonLink2: event.theme.buttonLink2 ?? "",
          displayType: event.theme.displayType,
          featureImageUrl: event.theme.featureImageUrl ?? "",
        },
      });
    } else {
      setEditingEvent(null);
      setFormData({
        name: "",
        slug: "",
        startDate: "",
        endDate: "",
        isActive: true,
        theme: {
          snowfall: false,
          decorations: false,
          countdownEnabled: false,
          countdownTargetDate: "",
          countdownType: "default",
          decorationEmojis: [],
          cardTitle: "",
          cardMessage: "",
          badgeText: "",
          buttonText1: "Khám Phá Sản Phẩm",
          buttonLink1: "/products",
          buttonText2: "",
          buttonLink2: "",
          displayType: "christmas-tree",
          featureImageUrl: "",
        },
      });
    }
    setActiveTab("basic");
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (!editingEvent && formData.name) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(prev.name || ""),
      }));
    }
  }, [formData.name, editingEvent]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.startDate || !formData.endDate) {
      toast.error("Vui lòng điền đầy đủ tên, ngày bắt đầu và kết thúc");
      return;
    }

    const slug = formData.slug || generateSlug(formData.name);

    let countdownTargetDate: string | undefined = undefined;
    if (
      formData.theme?.countdownEnabled &&
      formData.theme?.countdownTargetDate
    ) {
      countdownTargetDate = new Date(
        new Date(formData.theme.countdownTargetDate).getTime() -
          7 * 60 * 60 * 1000
      ).toISOString();
    }

    const dataToSend: Omit<
      Event,
      "_id" | "createdAt" | "updatedAt" | "createdBy"
    > = {
      name: formData.name,
      slug,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      isActive: formData.isActive ?? true,
      theme: {
        snowfall: formData.theme?.snowfall ?? false,
        decorations: formData.theme?.decorations ?? false,
        countdownEnabled: formData.theme?.countdownEnabled ?? false,
        countdownTargetDate,
        countdownType: formData.theme?.countdownType ?? "default",
        decorationEmojis: formData.theme?.decorationEmojis ?? [],
        cardTitle: formData.theme?.cardTitle ?? "",
        cardMessage: formData.theme?.cardMessage ?? "",
        badgeText: formData.theme?.badgeText ?? "",
        buttonText1: formData.theme?.buttonText1 ?? "Khám Phá Sản Phẩm",
        buttonLink1: formData.theme?.buttonLink1 ?? "/products",
        buttonText2: formData.theme?.buttonText2 ?? "",
        buttonLink2: formData.theme?.buttonLink2 ?? "",
        displayType: formData.theme?.displayType ?? "christmas-tree",
        featureImageUrl: formData.theme?.featureImageUrl ?? "",
      },
    };

    const toastId = toast.loading(
      editingEvent ? "Đang cập nhật..." : "Đang tạo sự kiện..."
    );

    try {
      if (editingEvent) {
        await updateEvent(editingEvent._id, dataToSend);
        toast.success("Cập nhật thành công! 🎉", { id: toastId });
      } else {
        await createEvent(dataToSend);
        toast.success("Tạo sự kiện thành công! ✨", { id: toastId });
      }
      setIsModalOpen(false);
      await fetchEvents();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Thao tác thất bại", {
        id: toastId,
      });
    }
  };

  const handleDelete = async (id: string) => {
    const toastId = toast.loading("Đang xóa sự kiện...");
    try {
      await deleteEvent(id);
      toast.success("Xóa sự kiện thành công!", { id: toastId });
      await fetchEvents();
      setDeleteConfirmModal({ isOpen: false, eventId: null, eventName: null });
    } catch {
      toast.error("Xóa sự kiện thất bại", { id: toastId });
    }
  };

  const openDeleteConfirm = (event: Event) => {
    setDeleteConfirmModal({
      isOpen: true,
      eventId: event._id,
      eventName: event.name,
    });
  };

  const handleToggleActive = async (id: string) => {
    const toastId = toast.loading("Đang thay đổi trạng thái...");
    try {
      await toggleEventActive(id);
      toast.success("Thành công!", { id: toastId });
      await fetchEvents();
    } catch {
      toast.error("Thất bại", { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 border-8 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const tabs = [
    { id: "basic" as const, label: "Thông tin cơ bản", icon: Calendar },
    { id: "content" as const, label: "Nội dung hiển thị", icon: Type },
    { id: "effects" as const, label: "Hiệu ứng & Hình ảnh", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý sự kiện
            </h1>
            <p className="text-gray-600 mt-1">
              Tạo và quản lý các sự kiện hiển thị trên trang chủ
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Tạo sự kiện mới
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const displayInfo = displayTypeOptions.find(
              (o) => o.value === event.theme.displayType
            )!;
            return (
              <div
                key={event._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-24 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-5xl">
                  {displayInfo.emoji}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {event.name}
                    </h3>
                    <button onClick={() => handleToggleActive(event._id)}>
                      {event.isActive ? (
                        <ToggleRight className="w-8 h-8 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-gray-400" />
                      )}
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    {format(new Date(event.startDate), "dd/MM/yyyy")} -{" "}
                    {format(new Date(event.endDate), "dd/MM/yyyy")}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {event.theme.snowfall && (
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                        ❄️ Tuyết
                      </span>
                    )}
                    {event.theme.decorations && (
                      <span className="px-2 py-1 bg-pink-50 text-pink-700 text-xs rounded-md">
                        🎀 Trang trí
                      </span>
                    )}
                    {event.theme.countdownEnabled && (
                      <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md">
                        ⏰ Đếm ngược
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(event)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Edit2 className="w-4 h-4" />
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={() => openDeleteConfirm(event)}
                      className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingEvent ? "Chỉnh sửa sự kiện" : "Tạo sự kiện mới"}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Điền thông tin để {editingEvent ? "cập nhật" : "tạo"} sự
                    kiện
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex border-b border-gray-200 px-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium text-sm">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeTab === "basic" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-5"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên sự kiện <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ví dụ: Giáng Sinh 2025"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Đường dẫn
                      </label>
                      <input
                        type="text"
                        value={formData.slug || ""}
                        readOnly
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                        placeholder="giang-sinh-2025"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ngày bắt đầu <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.startDate || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              startDate: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ngày kết thúc <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.endDate || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              endDate: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loại hiển thị
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {displayTypeOptions.map((opt) => (
                          <label
                            key={opt.value}
                            className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                              formData.theme?.displayType === opt.value
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="displayType"
                              value={opt.value}
                              checked={
                                formData.theme?.displayType === opt.value
                              }
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  theme: {
                                    ...formData.theme!,
                                    displayType: e.target.value as DisplayType,
                                  },
                                })
                              }
                              className="sr-only"
                            />
                            <span className="text-2xl">{opt.emoji}</span>
                            <span className="text-sm font-medium text-gray-700">
                              {opt.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "content" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-5"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tiêu đề card
                      </label>
                      <input
                        type="text"
                        value={formData.theme?.cardTitle || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            theme: {
                              ...formData.theme!,
                              cardTitle: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ví dụ: 🎄 Mùa Giáng Sinh Đặc Biệt 🎄"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nội dung card
                      </label>
                      <textarea
                        rows={4}
                        value={formData.theme?.cardMessage || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            theme: {
                              ...formData.theme!,
                              cardMessage: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="RetroTrade chúc bạn một mùa Giáng Sinh ấm áp và hạnh phúc!"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Text badge
                      </label>
                      <input
                        type="text"
                        value={formData.theme?.badgeText || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            theme: {
                              ...formData.theme!,
                              badgeText: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ví dụ: Giáng Sinh 2025"
                      />
                    </div>
                  </motion.div>
                )}

                {activeTab === "effects" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Hiệu ứng hiển thị
                      </label>
                      <div className="space-y-3">
                        {[
                          {
                            key: "snowfall",
                            label: "❄️ Hiệu ứng tuyết rơi",
                            desc: "Tuyết rơi nhẹ nhàng trên trang",
                          },
                          {
                            key: "decorations",
                            label: "🎀 Emoji trang trí bay",
                            desc: "Các emoji bay lượn đẹp mắt",
                          },
                          {
                            key: "countdownEnabled",
                            label: "⏰ Khung đếm ngược",
                            desc: "Hiển thị countdown đến ngày bạn chọn",
                          },
                        ].map((effect) => (
                          <label
                            key={effect.key}
                            className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={
                                (formData.theme?.[
                                  effect.key as keyof Event["theme"]
                                ] as boolean) ?? false
                              }
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  theme: {
                                    ...formData.theme!,
                                    [effect.key]: e.target.checked,
                                  },
                                })
                              }
                              className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {effect.label}
                              </div>
                              <div className="text-sm text-gray-600 mt-0.5">
                                {effect.desc}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {formData.theme?.countdownEnabled && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Kiểu khung đếm ngược
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {countdownTypeOptions.map((opt) => (
                            <label
                              key={opt.value}
                              className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                formData.theme?.countdownType === opt.value
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="radio"
                                name="countdownType"
                                value={opt.value}
                                checked={
                                  formData.theme?.countdownType === opt.value
                                }
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    theme: {
                                      ...formData.theme!,
                                      countdownType: e.target
                                        .value as Event["theme"]["countdownType"],
                                    },
                                  })
                                }
                                className="sr-only"
                              />
                              {opt.emoji && (
                                <span className="text-xl">{opt.emoji}</span>
                              )}
                              <span className="text-sm font-medium text-gray-700">
                                {opt.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData.theme?.countdownEnabled && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Đếm ngược đến ngày/giờ (giờ Việt Nam){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="datetime-local"
                          required={formData.theme?.countdownEnabled}
                          value={formData.theme?.countdownTargetDate || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              theme: {
                                ...formData.theme!,
                                countdownTargetDate: e.target.value,
                              },
                            })
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Nếu không chọn, sẽ dùng ngày kết thúc sự kiện làm mốc
                        </p>
                      </div>
                    )}

                    {formData.theme?.decorations && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Chọn emoji trang trí
                        </label>
                        <div className="grid grid-cols-8 gap-2 p-4 bg-gray-50 rounded-lg max-h-60 overflow-y-auto">
                          {decorationEmojiOptions.map((emoji) => (
                            <label
                              key={emoji}
                              className={`flex items-center justify-center p-3 rounded-lg cursor-pointer transition-all ${
                                formData.theme?.decorationEmojis?.includes(
                                  emoji
                                )
                                  ? "bg-blue-100 ring-2 ring-blue-500"
                                  : "bg-white hover:bg-gray-100"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={
                                  formData.theme?.decorationEmojis?.includes(
                                    emoji
                                  ) ?? false
                                }
                                onChange={(e) => {
                                  const current =
                                    formData.theme?.decorationEmojis ?? [];
                                  setFormData({
                                    ...formData,
                                    theme: {
                                      ...formData.theme!,
                                      decorationEmojis: e.target.checked
                                        ? [...current, emoji]
                                        : current.filter((e) => e !== emoji),
                                    },
                                  });
                                }}
                                className="sr-only"
                              />
                              <span className="text-2xl">{emoji}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Ảnh đặc trưng (tùy chọn)
                      </label>
                      {formData.theme?.featureImageUrl ? (
                        <div className="relative">
                          <div className="relative w-full h-48 rounded-lg overflow-hidden">
                            <Image
                              src={formData.theme.featureImageUrl}
                              alt="Feature"
                              fill
                              sizes="(max-width: 768px) 100vw, 50vw"
                              className="object-cover"
                              priority
                            />
                          </div>
                          <button
                            onClick={() =>
                              setFormData({
                                ...formData,
                                theme: {
                                  ...formData.theme!,
                                  featureImageUrl: "",
                                },
                              })
                            }
                            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                          <ImagePlus className="w-12 h-12 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">
                            Click để upload ảnh
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            JPG, PNG (tối đa 5MB)
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file || !editingEvent) return;

                              try {
                                const updated = await uploadFeatureImage(
                                  editingEvent._id,
                                  file
                                );
                                setFormData({
                                  ...formData,
                                  theme: {
                                    ...formData.theme!,
                                    featureImageUrl:
                                      updated.theme.featureImageUrl,
                                  },
                                });
                                toast.success("Upload ảnh thành công!");
                              } catch {
                                toast.error("Upload thất bại");
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                  {editingEvent ? "Cập nhật" : "Tạo sự kiện"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirmModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() =>
              setDeleteConfirmModal({
                isOpen: false,
                eventId: null,
                eventName: null,
              })
            }
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Xác nhận xóa sự kiện
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Bạn có chắc chắn muốn xóa sự kiện này?
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm font-medium text-red-800">
                  {deleteConfirmModal.eventName}
                </p>
                <p className="text-xs text-red-700 mt-1">
                  Hành động này không thể hoàn tác.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() =>
                    setDeleteConfirmModal({
                      isOpen: false,
                      eventId: null,
                      eventName: null,
                    })
                  }
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() =>
                    deleteConfirmModal.eventId &&
                    handleDelete(deleteConfirmModal.eventId)
                  }
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm"
                >
                  Xóa sự kiện
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
