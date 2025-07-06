import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import Header from "@/components/Header";
import {
  pruneUploadRecordsByRef,
  useCreateUploadRecords,
  useUploadRecords,
} from "@/hooks/useUploadRecords";
import ImageLightbox from "@/components/ImageLightbox";
import FileUploadDialog from "@/components/FileUploadDialog";
import { FileStack } from "lucide-react";
import { uploadFilesToService } from "@/services/uploadService";
import clsx from "clsx";

const EditProduct = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    original_price: "",
    unit: "kg",
    quantity: "",
    category_id: "",
    image_url: "",
    location: "",
    origin: "",
    certification: "",
    delivery_time: "",
  });
  const [uploadCoverDialogOpen, setUploadCoverDialogOpen] = useState(false);
  const [uploadedCover, setUploadedCover] = useState<File>();
  const [coverPreview, setCoverPreview] = useState<string>();

  const [uploadProductImagesDialogOpen, setUploadProductImagesDialogOpen] =
    useState(false);
  const [uploadedProductImages, setUploadedProductImages] = useState<
    { url: string; name: string; isNew: boolean; file: File }[]
  >([]);

  const { mutate: createUploadRecords, isPending } = useCreateUploadRecords();

  const [productImagesListChanged, setProductImagesListChanged] = useState(
    false,
  );

  const {
    data: productImages,
    isLoading: productImagesLoading,
    error: productImagesError,
  } = useUploadRecords({
    content_type: "product_image",
    ref: id,
  });

  const resetProductImages = useCallback(() => {
    if (productImages) {
      setProductImagesListChanged(false);
      setUploadedProductImages(
        productImages.filter((imageRecord) =>
          imageRecord.url !== product.image_url
        ).map((imageRecord) => ({
          url: imageRecord.url,
          name: imageRecord.id,
          isNew: false,
          file: null,
        })),
      );
    }
  }, [productImages, product.image_url]);

  useEffect(() => {
    fetchCategories();
    fetchProduct();
    resetProductImages();
    // eslint-disable-next-line
  }, [id, product.image_url]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      toast.error("Lỗi khi tải danh mục");
    }
  };

  const fetchProduct = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      setProduct({
        name: data.name || "",
        description: data.description || "",
        price: data.price?.toString() || "",
        original_price: data.original_price?.toString() || "",
        unit: data.unit || "kg",
        quantity: data.quantity?.toString() || "",
        category_id: data.category_id || "",
        image_url: data.image_url || "",
        location: data.location || "",
        origin: data.origin || "",
        certification: data.certification || "",
        delivery_time: data.delivery_time || "",
      });
    } catch (error) {
      toast.error("Không tìm thấy sản phẩm");
      navigate("/seller/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeUploadCover = (files: FileList) => {
    const images = Array.from(files);
    const newCover = images[0];
    if (newCover) {
      const url = URL.createObjectURL(newCover);
      setCoverPreview(url);
      setUploadedCover(newCover);
    } else {
      toast.error("Lỗi khi tải ảnh");
    }
  };

  const clearUploadCover = () => {
    setCoverPreview(undefined);
    setUploadedCover(undefined);
  };

  const handleChangeUploadProductImages = (files: FileList) => {
    const images = Array.from(files)
      .filter((newImage) => {
        const duplicated = uploadedProductImages.find((file) =>
          file.name === newImage.name
        );
        if (duplicated) {
          toast.warning(`Không thể tải ảnh "${newImage.name}"`, {
            description: "Ảnh bị lặp",
          });
        }
        return !duplicated;
      }); // De-duplicate images

    const urls = images.map((imgFile) => ({
      url: URL.createObjectURL(imgFile),
      name: imgFile.name,
      isNew: true,
      file: imgFile,
    }));
    setUploadedProductImages((prev) => {
      setProductImagesListChanged(true);
      return [...prev, ...urls];
    });
  };

  const removeProductImage = (name: string) => {
    setUploadedProductImages((prev) => {
      setProductImagesListChanged(true);
      return prev.filter((imgUrl) => imgUrl.name !== name);
    });
  };

  const clearProductImages = () => {
    setUploadedProductImages([]);
    setProductImagesListChanged(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product.category_id) {
      toast.error("Vui lòng chọn danh mục sản phẩm");
      return;
    }
    setLoading(true);

    try {
      // Upload all images to upload service
      const imagesToUpload = [];
      if (uploadedCover) imagesToUpload.push(uploadedCover);
      if (productImagesListChanged) {
        imagesToUpload.push(
          ...uploadedProductImages.filter((image) => image.isNew),
        );
        imagesToUpload.map((image) => image.file);
      }

      let results = [];
      try {
        results = await uploadFilesToService(
          imagesToUpload,
          "productImages",
        );
      } catch (e) {
        console.error(e);
      }

      const { error, data } = await supabase
        .from("products")
        .update({
          name: product.name,
          description: product.description,
          price: parseFloat(product.price),
          original_price: product.original_price
            ? parseFloat(product.original_price)
            : null,
          unit: product.unit,
          quantity: parseInt(product.quantity),
          category_id: product.category_id,
          image_url: (uploadedCover && !!results[0])
            ? results[0].url
            : product.image_url,
          location: product.location,
          origin: product.origin,
          certification: product.certification,
          delivery_time: product.delivery_time,
        })
        .eq("id", id)
        .select();
      if (error) throw error;

      if (imagesToUpload.length + (uploadedCover ? 1 : 0) > results.length) {
        toast.warning("Đã xảy ra lỗi trong quá trình lưu hình ảnh sản phẩm", {
          description: "Một hoặc nhiều ảnh đã không được tải lên",
        });
      }

      // Delete all product image records that were unselected
      pruneUploadRecordsByRef(
        data?.[0]?.id,
        uploadedProductImages.map((record) => record.url),
      );

      createUploadRecords(results.map((result) => ({
        url: result.url,
        content_type: "product_image",
        ref: data?.[0]?.id,
      })));

      toast.success("Cập nhật sản phẩm thành công!");
      navigate("/seller/dashboard");
    } catch (error) {
      toast.error("Lỗi khi cập nhật sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const coverImageDisplayUrl = coverPreview ?? product.image_url;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Chỉnh sửa sản phẩm
            </h1>
            <p className="text-gray-600">Cập nhật thông tin sản phẩm của bạn</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin sản phẩm</CardTitle>
              <CardDescription>
                Chỉnh sửa thông tin để khách hàng có thể hiểu rõ về sản phẩm của
                bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Tên sản phẩm *</Label>
                    <Input
                      id="name"
                      value={product.name}
                      onChange={(e) =>
                        setProduct({ ...product, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Danh mục *</Label>
                    <Select
                      value={product.category_id}
                      onValueChange={(value) =>
                        setProduct({ ...product, category_id: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.icon} {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Mô tả sản phẩm</Label>
                  <Textarea
                    id="description"
                    value={product.description}
                    onChange={(e) =>
                      setProduct({ ...product, description: e.target.value })}
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Giá bán *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={product.price}
                      onChange={(e) =>
                        setProduct({ ...product, price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="originalPrice">Giá gốc</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={product.original_price}
                      onChange={(e) =>
                        setProduct({
                          ...product,
                          original_price: e.target.value,
                        })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Đơn vị *</Label>
                    <Select
                      value={product.unit}
                      onValueChange={(value) =>
                        setProduct({ ...product, unit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kg</SelectItem>
                        <SelectItem value="gam">Gam</SelectItem>
                        <SelectItem value="túi">Túi</SelectItem>
                        <SelectItem value="hộp">Hộp</SelectItem>
                        <SelectItem value="con">Con</SelectItem>
                        <SelectItem value="quả">Quả</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="quantity">Số lượng có sẵn *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={product.quantity}
                    onChange={(e) =>
                      setProduct({ ...product, quantity: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label
                    htmlFor="coverImage"
                    className="flex justify-between items-center mb-4"
                  >
                    Ảnh bìa
                    <div className="flex gap-2">
                      {coverPreview && (
                        <button
                          className="px-2 py-1 text-sm text-white rounded-md bg-red-600 hover:bg-red-500 transition"
                          type="button"
                          onClick={() => clearUploadCover()}
                        >
                          Đặt lại ảnh bìa
                        </button>
                      )}

                      <button
                        className="px-2 py-1 text-sm text-white rounded-md bg-green-600 hover:bg-green-500 transition"
                        type="button"
                        onClick={() => setUploadCoverDialogOpen(true)}
                      >
                        Thay ảnh bìa
                      </button>
                    </div>
                  </Label>
                  <div className="relative">
                    {coverImageDisplayUrl && (
                      <ImageLightbox
                        key={coverPreview}
                        src={coverImageDisplayUrl}
                        className="w-[320px] h-[180px] object-contain scale-100 hover:scale-105 transition-transform duration-300"
                        alt={coverPreview}
                      />
                    )}
                    {!coverImageDisplayUrl &&
                      (
                        <div className="p-4 text-gray-600 text-center rounded-md my-2">
                          Sản phẩm chưa có ảnh bìa!
                        </div>
                      )}

                    <FileUploadDialog
                      open={uploadCoverDialogOpen}
                      onOpenChange={setUploadCoverDialogOpen}
                      multiple={false}
                      accept="image/*"
                      label="Nhấn để chọn ảnh bìa sản phẩm"
                      hint="Chọn file ảnh với định dạng .jpg, .jpeg, .png, hoặc .gif"
                      onUpload={(files) => handleChangeUploadCover(files)}
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="productImages"
                    className="flex justify-between items-center"
                  >
                    Ảnh sản phẩm
                    <div>
                      {productImagesListChanged &&
                        (
                          <button
                            className="me-2 px-2 py-1 text-sm text-white rounded-md bg-red-600 hover:bg-red-500 transition"
                            type="button"
                            onClick={resetProductImages}
                          >
                            Đặt lại ảnh
                          </button>
                        )}
                      {!!uploadedProductImages.length &&
                        (
                          <button
                            className="me-2 px-2 py-1 text-sm text-white rounded-md bg-red-600 hover:bg-red-500 transition"
                            type="button"
                            onClick={clearProductImages}
                          >
                            Xóa tất cả
                          </button>
                        )}
                      <button
                        className="px-2 py-1 text-sm text-white rounded-md bg-green-600 hover:bg-green-500 transition"
                        type="button"
                        onClick={() => setUploadProductImagesDialogOpen(true)}
                      >
                        Thêm ảnh
                      </button>
                    </div>
                  </Label>
                  <div
                    className={clsx(
                      "relative p-4 rounded-md my-2",
                      productImagesListChanged
                        ? "bg-yellow-700/20"
                        : "bg-gray-200",
                    )}
                  >
                    <div className="flex flex-row flex-wrap justify-around gap-8">
                      {!uploadedProductImages.length && (
                        <div className="flex flex-col items-center text-gray-600 gap-4">
                          <FileStack width={"120px"} height={"120px"} />
                          <p>Hãy tải lên các hình ảnh mô tả về sản phẩm</p>
                        </div>
                      )}
                      {!!uploadedProductImages.length &&
                        uploadedProductImages.map((productImage) => (
                          <ImageLightbox
                            key={productImage.url}
                            src={productImage.url}
                            className="w-[160px] h-[90px] object-contain scale-100 hover:scale-105 transition-transform duration-300"
                            alt={productImage.url}
                            onRemove={() =>
                              removeProductImage(productImage.name)}
                          />
                        ))}
                    </div>

                    <FileUploadDialog
                      open={uploadProductImagesDialogOpen}
                      onOpenChange={setUploadProductImagesDialogOpen}
                      multiple={true}
                      accept="image/*"
                      label="Nhấn để chọn ảnh sản phẩm"
                      hint="Chọn file ảnh với định dạng .jpg, .jpeg, .png, hoặc .gif"
                      onUpload={(files) =>
                        handleChangeUploadProductImages(files)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Thông tin bổ sung
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Khu vực</Label>
                      <Input
                        id="location"
                        value={product.location}
                        onChange={(e) =>
                          setProduct({ ...product, location: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="origin">Nguồn gốc</Label>
                      <Input
                        id="origin"
                        value={product.origin}
                        onChange={(e) =>
                          setProduct({ ...product, origin: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="certification">Chứng nhận</Label>
                      <Input
                        id="certification"
                        value={product.certification}
                        onChange={(e) =>
                          setProduct({
                            ...product,
                            certification: e.target.value,
                          })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="deliveryTime">Thời gian giao hàng</Label>
                      <Input
                        id="deliveryTime"
                        value={product.delivery_time}
                        onChange={(e) =>
                          setProduct({
                            ...product,
                            delivery_time: e.target.value,
                          })}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={loading}
                  >
                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/seller/dashboard")}
                  >
                    Hủy
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;

