"use client";
import * as React from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";  
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import Image from "next/image";
import type { Product } from "@/types/Product";

const formSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(10, "Phone number is required"),
  email: z.string().email("Invalid email"),
  quantity: z.coerce.number().min(100, "Minimum order quantity is 100"),
  pincode: z
    .coerce
    .number()
    .int()
    .min(100000, "Enter a valid 6-digit pincode")
    .max(999999, "Enter a valid 6-digit pincode"),
  address: z.string().min(5, "Address is required"),
  description: z.string().optional(),
  companyName: z.string().optional(),
  gst: z.string().optional(),
  orderNotes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EnquiryFormContentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProducts?: Product[];
  onSubmitAfter?: () => void;
}

export function EnquiryFormContent({ open, onOpenChange, selectedProducts = [], onSubmitAfter }: EnquiryFormContentProps) {
  const [files, setFiles] = React.useState<File[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      fullName: "",
      companyName: "",
      gst: "",
      phone: "",
      email: "",
      quantity: 100,
      pincode: 110001,
      address: "",
      orderNotes: "",
    },
  });

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [], "application/pdf": [] },
    multiple: true,
  });

  const onSubmit = async (data: FormData) => {
    try {
      const submitData = new FormData();
      submitData.append('fullName', data.fullName);
      submitData.append('companyName', data.companyName || '');
      submitData.append('phone', data.phone);
      submitData.append('email', data.email);
      submitData.append('quantity', data.quantity.toString());
      submitData.append('pincode', data.pincode.toString());
      submitData.append('address', data.address);
      submitData.append('description', data.description || '');
      submitData.append('gst', data.gst || '');
      submitData.append('orderNotes', data.orderNotes || '');
      submitData.append('selectedProducts', JSON.stringify(selectedProducts));
      
      files.forEach((file) => {
        submitData.append('files', file);
      });
      
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        body: submitData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Enquiry submitted successfully!');
        form.reset();
        setFiles([]);
        onOpenChange(false);
        onSubmitAfter?.();
      } else {
        toast.error(result.message || 'Failed to submit enquiry');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('An error occurred while submitting. Please try again.');
    }
  };

  React.useEffect(() => {
    if (selectedProducts.length > 0) {
      const productList = selectedProducts.map(p => `${p.name} - ₹${p.price}`).join('\n');
      form.setValue('description', `Interested in the following products:\n${productList}`);
    }
  }, [selectedProducts, form]);

  return (
    <DialogContent className="w-full max-w-4xl p-6 rounded-lg border border-gray-200 bg-white max-h-[90vh] overflow-y-auto">
      {selectedProducts.length > 0 && (
        <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <h4 className="font-bold text-[#0F172A] mb-3">Selected Products ({selectedProducts.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100 shadow-xs">
                <Image src={product.image} alt={product.name} width={60} height={60} className="object-cover rounded-md" />
                <div>
                  <p className="font-semibold text-sm text-slate-900">{product.name}</p>
                  <p className="text-[#0F172A] font-bold text-xs">{product.currency} {product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <DialogHeader className="space-y-4 text-center mb-8">
        <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#0F172A] bg-[#0F172A]/10 rounded-full">
          Tailored Corporate Solutions
        </span>
        <DialogTitle className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Product Enquiry Form
        </DialogTitle>
        <DialogDescription className="max-w-2xl mx-auto text-gray-600">
          Share your requirements for premium diaries and corporate gifts. Our team will respond within 24 hours with personalized options and pricing.
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700 mb-2 block">Full Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your full name"
                      className="h-12 px-4 border border-gray-300 rounded-lg focus:border-[#0F172A] focus:ring-2 focus:ring-[#0F172A]/10 transition-all"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700 mb-2 block">Company Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter company name"
                      className="h-12 px-4 border border-gray-300 rounded-lg focus:border-[#0F172A] focus:ring-2 focus:ring-[#0F172A]/10 transition-all"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700 mb-2 block">Phone Number <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="Enter phone number"
                      className="h-12 px-4 border border-gray-300 rounded-lg focus:border-[#0F172A] focus:ring-2 focus:ring-[#0F172A]/10 transition-all"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700 mb-2 block">Email Address <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      className="h-12 px-4 border border-gray-300 rounded-lg focus:border-[#0F172A] focus:ring-2 focus:ring-[#0F172A]/10 transition-all"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700 mb-2 block">Quantity <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter quantity"
                      className="h-12 px-4 border border-gray-300 rounded-lg focus:border-[#0F172A] focus:ring-2 focus:ring-[#0F172A]/10 transition-all"
                      min={100}
                      step={1}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pincode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700 mb-2 block">Pincode <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter pincode"
                      className="h-12 px-4 border border-gray-300 rounded-lg focus:border-[#0F172A] focus:ring-2 focus:ring-[#0F172A]/10 transition-all"
                      min={100000}
                      max={999999}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-gray-700 mb-2 block">Delivery Address <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter your complete delivery address"
                    className="min-h-[100px] px-4 py-3 border border-gray-300 rounded-lg focus:border-[#0F172A] focus:ring-2 focus:ring-[#0F172A]/10 transition-all resize-vertical"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500 mt-1" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700 mb-2 block">Product Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your requirements (e.g., customization, quantities, deadlines)"
                      className="min-h-[100px] px-4 py-3 border border-gray-300 rounded-lg focus:border-[#0F172A] focus:ring-2 focus:ring-[#0F172A]/10 transition-all resize-vertical"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />
            <div>
              <FormLabel className="text-sm font-semibold text-gray-700 mb-2 block">GST Number</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter GST number (optional)"
                  className="h-12 px-4 border border-gray-300 rounded-lg focus:border-[#0F172A] focus:ring-2 focus:ring-[#0F172A]/10 transition-all"
                  {...form.register("gst")}
                />
              </FormControl>
            </div>
          </div>

          <FormField
            control={form.control}
            name="orderNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-gray-700 mb-2 block">Additional Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any special instructions or preferences"
                    className="min-h-[80px] px-4 py-3 border border-gray-300 rounded-lg focus:border-[#0F172A] focus:ring-2 focus:ring-[#0F172A]/10 transition-all resize-vertical"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500 mt-1" />
              </FormItem>
            )}
          />

          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <Label className="text-sm font-semibold text-gray-700 mb-3 block">Attach Design Files (Optional)</Label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragActive
                  ? "border-[#0F172A] bg-[#0F172A]/5"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input {...getInputProps()} />
              <p className="text-gray-600 mb-2">
                {isDragActive ? "Drop the files here..." : "Drag & drop files here, or click to select"}
              </p>
              <p className="text-xs text-gray-500 mb-4">Supports PNG, JPG, PDF up to 10MB each</p>
              {files.length > 0 && (
                <p className="text-sm font-medium text-[#0F172A]">
                  {files.length} file{files.length > 1 ? "s" : ""} selected
                </p>
              )}
            </div>
            {files.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {files.map((file, idx) => (
                  <div key={idx} className="relative border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="h-20 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                    <div className="p-2 bg-gray-50">
                      <p className="text-xs text-gray-600 truncate">{file.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              className="h-12 px-8 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex-1 sm:flex-none rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="h-12 px-8 bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold rounded-xl transition-colors flex-1 sm:flex-none shadow-md hover:shadow-lg"
            >
              Submit Enquiry
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
