import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MapPin, Phone, Shield, Store, User } from "lucide-react";
import Header from "@/components/Header";
import FileUploadDialog from "@/components/FileUploadDialog";
import { uploadFilesToService } from "@/services/uploadService";
import ImageLightbox from "@/components/ImageLightbox";
import clsx from "clsx";
import {
  useCreateUploadRecords,
  useUploadRecords,
} from "@/hooks/useUploadRecords";

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    address: "",
    shop_description: "",
    payment_description: "",
    avatar_url: "",
    user_type: "buyer",
    is_verified: false,
  });

  const {
    data: fetchedQR,
    isLoading: fetchingQR,
    error: fetchingQRError,
  } = useUploadRecords({
    content_type: "payment_qr",
    user_id: user.id,
    order: "desc",
    limit: 1,
  });

  const [uploadAvatarDialogOpen, setUploadAvatarDialogOpen] = useState(false);
  const [uploadedAvatar, setUploadedAvatar] = useState<File>();
  const [avatarPreview, setAvatarPreview] = useState<string>();

  const [uploadQRDialogOpen, setUploadQRDialogOpen] = useState(false);
  const [uploadedQR, setUploadedQR] = useState<File>();
  const [qrPreview, setQRPreview] = useState<string>();

  const { mutate: createUploadRecords, isPending } = useCreateUploadRecords();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Lỗi khi tải thông tin hồ sơ");
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const results = await uploadFilesToService(
        [uploadedQR],
        "paymentQRs",
      );
      const result = results[0];
      if (result) {
        createUploadRecords([{
          url: result.url,
          content_type: "payment_qr",
        }]);

        setUploadedQR(undefined);
      } else {
        throw new Error("No errors received, but qr upload result is empty");
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          address: profile.address,
          shop_description: profile.shop_description,
          payment_description: profile.payment_description,
          avatar_url: profile.avatar_url,
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast.success("Cập nhật hồ sơ thành công!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Lỗi khi cập nhật hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  const getUserTypeText = (type: string) => {
    switch (type) {
      case "buyer":
        return "Người mua";
      case "seller":
        return "Người bán";
      case "admin":
        return "Quản trị viên";
      default:
        return "Người dùng";
    }
  };

  const handleChangeUploadAvatar = (files: FileList) => {
    const images = Array.from(files);
    const newAvatar = images[0];
    if (newAvatar) {
      const url = URL.createObjectURL(newAvatar);
      setAvatarPreview(url);
      setUploadedAvatar(newAvatar);
    } else {
      toast.error("Lỗi khi tải ảnh");
    }
  };

  const clearUploadAvatar = () => {
    setAvatarPreview(undefined);
    setUploadedAvatar(undefined);
  };

  const updateAvatar = async () => {
    if (!uploadedAvatar) {
      toast.error("Hãy tải ảnh lên trước khi cập nhật ảnh đại diện");
      return;
    }

    try {
      const results = await uploadFilesToService(
        [uploadedAvatar],
        "profileImages",
      );
      const result = results[0];
      if (result) {
        const { error } = await supabase
          .from("profiles")
          .update({
            avatar_url: result.url,
          })
          .eq("id", user?.id);

        if (error) throw error;

        toast.success("Cập nhật ảnh đại diện thành công!");
        setUploadedAvatar(undefined);
      } else {
        throw new Error("No errors received, but the upload result is empty");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Lỗi khi cập nhật ảnh đại diện");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeUploadQR = (files: FileList) => {
    const images = Array.from(files);
    const newQR = images[0];
    if (newQR) {
      const url = URL.createObjectURL(newQR);
      setQRPreview(url);
      setUploadedQR(newQR);
    } else {
      toast.error("Lỗi khi tải ảnh");
    }
  };

  const clearUploadQR = () => {
    setQRPreview(undefined);
    setUploadedQR(undefined);
  };

  const displayedQR = qrPreview ?? fetchedQR?.[0]?.url;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Hồ sơ cá nhân
            </h1>
            <p className="text-gray-600">
              Quản lý thông tin tài khoản và cài đặt của bạn
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Info Card */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <Avatar className="w-24 h-24 mx-auto">
                    <AvatarImage src={avatarPreview ?? profile.avatar_url} />
                    <AvatarFallback className="text-2xl">
                      {profile.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>

                  {!uploadedAvatar &&
                    (
                      <div>
                        <button
                          className="px-2 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200"
                          type="button"
                          onClick={() => setUploadAvatarDialogOpen(true)}
                        >
                          Thay ảnh đại diện
                        </button>
                      </div>
                    )}

                  {uploadedAvatar &&
                    (
                      <div>
                        <button
                          className="px-2 py-1 mx-1 text-sm text-white rounded-md bg-blue-600 hover:bg-blue-700"
                          type="button"
                          onClick={updateAvatar}
                        >
                          Cập nhật
                        </button>
                        <button
                          className="px-2 py-1 mx-1 text-sm text-white rounded-md bg-red-600 hover:bg-red-700"
                          type="button"
                          onClick={clearUploadAvatar}
                        >
                          Hủy
                        </button>
                      </div>
                    )}

                  <FileUploadDialog
                    open={uploadAvatarDialogOpen}
                    onOpenChange={setUploadAvatarDialogOpen}
                    multiple={false}
                    accept="image/*"
                    label="Nhấn để chọn ảnh đại diện"
                    hint="Chọn file ảnh với định dạng .jpg, .jpeg, .png, hoặc .gif"
                    onUpload={(files) => handleChangeUploadAvatar(files)}
                  />

                  <div className="mb-4" />

                  <CardTitle>{profile.full_name || "Chưa cập nhật"}</CardTitle>
                  <CardDescription>{user?.email}</CardDescription>
                  <div className="flex justify-center gap-2 mt-4">
                    <Badge
                      variant={profile.user_type === "seller"
                        ? "default"
                        : "secondary"}
                    >
                      {getUserTypeText(profile.user_type)}
                    </Badge>
                    {profile.is_verified && (
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-600"
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        Đã xác thực
                      </Badge>
                    )}
                  </div>
                </CardHeader>
              </Card>

              {profile.user_type === "seller" && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Store className="w-5 h-5 mr-2" />
                      Thông tin cửa hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-2">
                      Mô tả cửa hàng:
                    </p>
                    <p className="text-gray-900">
                      {profile.shop_description || "Chưa có mô tả"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin cá nhân</CardTitle>
                  <CardDescription>
                    Cập nhật thông tin để khách hàng có thể liên hệ với bạn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={updateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Họ và tên</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="fullName"
                            className="pl-10"
                            placeholder="Nhập họ và tên"
                            value={profile.full_name}
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                full_name: e.target.value,
                              })}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="phone"
                            className="pl-10"
                            placeholder="0123456789"
                            value={profile.phone}
                            onChange={(e) =>
                              setProfile({ ...profile, phone: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Địa chỉ</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="address"
                          className="pl-10"
                          placeholder="Nhập địa chỉ đầy đủ"
                          value={profile.address}
                          onChange={(e) =>
                            setProfile({ ...profile, address: e.target.value })}
                        />
                      </div>
                    </div>

                    {profile.user_type === "seller" && (
                      <>
                        <div>
                          <Label htmlFor="shopDescription">
                            Mô tả cửa hàng
                          </Label>
                          <Textarea
                            id="shopDescription"
                            placeholder="Giới thiệu về cửa hàng, sản phẩm của bạn..."
                            value={profile.shop_description}
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                shop_description: e.target.value,
                              })}
                            rows={4}
                          />
                        </div>

                        <div>
                          <Label htmlFor="shopDescription">
                            Phương thức thanh toán
                          </Label>
                          <Textarea
                            id="shopDescription"
                            placeholder="Ghi chi tiết về phương thức thanh toán của bạn"
                            value={profile.payment_description}
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                payment_description: e.target.value,
                              })}
                            rows={4}
                            className="mb-2"
                          />
                          <Label htmlFor="shopDescription">
                            QR thanh toán
                          </Label>
                          <div
                            className={clsx(
                              "flex flex-col gap-0 p-2 rounded-md",
                              displayedQR ? "bg-gray-200" : "",
                            )}
                          >
                            {displayedQR && (
                              <ImageLightbox
                                src={displayedQR}
                                alt={"Mã QR thanh toán"}
                                className="w-full"
                                imgClass="rounded-b-none"
                              />
                            )}
                            <Button
                              type="button"
                              className={clsx(
                                "w-full bg-blue-500 hover:bg-blue-400",
                                displayedQR ? "rounded-t-none" : "",
                              )}
                              onClick={() => setUploadQRDialogOpen(true)}
                              disabled={loading}
                            >
                              Cập nhật QR
                            </Button>
                          </div>
                          <FileUploadDialog
                            open={uploadQRDialogOpen}
                            onOpenChange={setUploadQRDialogOpen}
                            multiple={false}
                            accept="image/*"
                            label="Nhấn để chọn ảnh QR"
                            hint="Chọn file ảnh với định dạng .jpg, .jpeg, .png, hoặc .gif"
                            onUpload={(files) => handleChangeUploadQR(files)}
                          />
                        </div>
                      </>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={loading}
                    >
                      {loading ? "Đang cập nhật..." : "Cập nhật hồ sơ"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
