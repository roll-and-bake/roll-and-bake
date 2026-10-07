"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// --- Products ---
export async function getProducts() {
  const { data, error } = await supabase.from("products").select("*").order("id", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function toggleProductActive(id: number, currentStatus: any) {
  const newStatus = currentStatus === 1 || currentStatus === true ? false : true;
  const { error } = await supabase.from("products").update({ active: newStatus }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function updateProductPrice(id: number, price: number) {
  const { error } = await supabase.from("products").update({ price }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/products");
  revalidatePath("/");
}

// --- Orders ---
export async function createOrder(data: any) {
  const { customerName, phone, email, totalAmount, deliveryMethod, address, receiptPreference, notes, items } = data;
  
  const { data: orderData, error: orderError } = await supabase.from("orders").insert({
    customer_name: customerName,
    phone,
    email,
    total_amount: totalAmount,
    delivery_method: deliveryMethod,
    address,
    receipt_preference: receiptPreference || "whatsapp",
    notes,
    is_archived: false
  }).select("id").single();
  
  if (orderError) throw orderError;
  const orderId = orderData.id;
  
  const orderItems = items.map((item: any) => ({
    order_id: orderId,
    product_id: item.id,
    product_name: item.name,
    quantity: item.quantity,
    price: item.price
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
  if (itemsError) throw itemsError;
  
  await generateSumitReceipt(Number(orderId));
  
  revalidatePath("/admin");
  revalidatePath("/admin/pipeline");
  
  return { success: true, orderId };
}

export async function getOrders() {
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .or("is_archived.eq.false,is_archived.is.null")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return orders?.map(o => ({ ...o, items: o.order_items })) || [];
}

export async function updateOrderStatus(id: number, status: string) {
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/pipeline");
  revalidatePath("/admin");
}

// --- Settings (YPAY & Store) ---
export async function getSettings() {
  const { data: rows, error } = await supabase.from("settings").select("*");
  if (error) throw error;
  
  const settings: Record<string, string> = {};
  if (rows) {
    for (const row of rows) settings[row.key] = row.value;
  }
  return settings;
}

export async function updateSetting(key: string, value: string) {
  const { data: existing, error: checkError } = await supabase.from("settings").select("*").eq("key", key).maybeSingle();
  if (checkError) throw checkError;
  
  if (existing) {
    const { error: updateError } = await supabase.from("settings").update({ value }).eq("key", key);
    if (updateError) throw updateError;
  } else {
    const { error: insertError } = await supabase.from("settings").insert({ key, value });
    if (insertError) throw insertError;
  }
  
  revalidatePath("/");
  revalidatePath("/admin/settings");
}

export async function updateYpayToken(token: string) {
  const { error } = await supabase.from("settings").update({ value: token }).eq("key", "ypay_token");
  if (error) throw error;
  revalidatePath("/admin");
}

// --- Dashboard Stats ---
export async function getDashboardStats() {
  const { data: revenueData, error: revError } = await supabase
    .from("orders")
    .select("total_amount")
    .neq("status", "בוטל")
    .or("is_archived.eq.false,is_archived.is.null");
  
  if (revError) throw revError;
  const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
  
  const { count: openOrders, error: openError } = await supabase
    .from("orders")
    .select("*", { count: 'exact', head: true })
    .not("status", "in", '("מוכן לאיסוף", "הושלם", "בוטל")')
    .or("is_archived.eq.false,is_archived.is.null");
  if (openError) throw openError;

  const { data: customersData, error: custError } = await supabase
    .from("orders")
    .select("phone")
    .or("is_archived.eq.false,is_archived.is.null");
  if (custError) throw custError;
  const uniquePhones = new Set(customersData?.map(c => c.phone).filter(Boolean));
  const totalCustomers = uniquePhones.size;

  return {
    totalRevenue,
    openOrders: openOrders || 0,
    totalCustomers
  };
}

// --- Bundles / Physical Packaging ---
export async function getBundles() {
  const { data, error } = await supabase.from("bundles").select("*").order("capacity", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function addBundle(name: string, capacity: number, discount_percent: number) {
  const { error } = await supabase.from("bundles").insert({ name, capacity, discount_percent });
  if (error) throw error;
  revalidatePath("/admin/products");
}

export async function updateBundle(id: number, name: string, capacity: number, discount_percent: number) {
  const { error } = await supabase.from("bundles").update({ name, capacity, discount_percent }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/products");
}

export async function deleteBundle(id: number) {
  const { error } = await supabase.from("bundles").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/products");
}

// --- Discount Tiers (Quantity based) ---
export async function getDiscountTiers() {
  const { data, error } = await supabase.from("discount_tiers").select("*").order("min_qty", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function addDiscountTier(min_qty: number, discount_percent: number) {
  const { error } = await supabase.from("discount_tiers").insert({ min_qty, discount_percent });
  if (error) throw error;
  revalidatePath("/admin/products");
  revalidatePath("/admin/settings");
  revalidatePath("/");
}

export async function deleteDiscountTier(id: number) {
  const { error } = await supabase.from("discount_tiers").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/products");
  revalidatePath("/admin/settings");
  revalidatePath("/");
}

// --- Expenses ---
export async function getExpenses() {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .or("is_archived.eq.false,is_archived.is.null")
    .order("expense_date", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addExpense(data: any) {
  const { date, supplier, category, amount, receipt_image_url } = data;
  const { error } = await supabase.from("expenses").insert({
    expense_date: date,
    supplier,
    category,
    amount,
    receipt_image_url: receipt_image_url || null,
    is_archived: false
  });
  if (error) throw error;
  revalidatePath("/admin/expenses");
}

// --- Product Edits ---
export async function updateProductDetails(id: number, name: string, description: string, price: number, image_url: string) {
  const { error } = await supabase.from("products").update({ name, description, price, image_url }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function addProduct(name: string, description: string, price: number, image_url: string) {
  const { error } = await supabase.from("products").insert({ name, description, price, image_url });
  if (error) throw error;
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function deleteProduct(id: number) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/products");
  revalidatePath("/");
}

// --- Data Reset & Archive ---
export async function archiveAllData(archiveName: string) {
  if (!archiveName) throw new Error("Archive name is required");
  
  const { error: orderError } = await supabase
    .from("orders")
    .update({ is_archived: true, archive_name: archiveName })
    .or("is_archived.eq.false,is_archived.is.null");
  if (orderError) throw orderError;
    
  const { error: expenseError } = await supabase
    .from("expenses")
    .update({ is_archived: true, archive_name: archiveName })
    .or("is_archived.eq.false,is_archived.is.null");
  if (expenseError) throw expenseError;
  
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/pipeline");
  revalidatePath("/admin/expenses");
}

export async function deleteAllData() {
  const { error: itemsError } = await supabase.from("order_items").delete().neq("id", 0);
  if (itemsError) throw itemsError;
  const { error: ordersError } = await supabase.from("orders").delete().neq("id", 0);
  if (ordersError) throw ordersError;
  const { error: expensesError } = await supabase.from("expenses").delete().neq("id", 0);
  if (expensesError) throw expensesError;
  
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/pipeline");
  revalidatePath("/admin/expenses");
}

// --- Archives Queries ---
export async function getArchiveNames() {
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .select("archive_name")
    .eq("is_archived", true)
    .not("archive_name", "is", null);
  if (orderError) throw orderError;
  
  const { data: expenseData, error: expenseError } = await supabase
    .from("expenses")
    .select("archive_name")
    .eq("is_archived", true)
    .not("archive_name", "is", null);
  if (expenseError) throw expenseError;

  const archiveNames = new Set([
    ...(orderData?.map(r => r.archive_name) || []),
    ...(expenseData?.map(r => r.archive_name) || [])
  ]);
  
  return Array.from(archiveNames).filter(Boolean);
}

export async function getArchiveData(archiveName: string) {
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("is_archived", true)
    .eq("archive_name", archiveName)
    .order("created_at", { ascending: false });
  if (ordersError) throw ordersError;

  const { data: expenses, error: expensesError } = await supabase
    .from("expenses")
    .select("*")
    .eq("is_archived", true)
    .eq("archive_name", archiveName)
    .order("expense_date", { ascending: false });
  if (expensesError) throw expensesError;
  
  const mappedOrders = orders?.map(o => ({ ...o, items: o.order_items })) || [];

  return { orders: mappedOrders, expenses: expenses || [] };
}

export async function uploadImage(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file uploaded");

  const filename = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
  
  const { data, error } = await supabase.storage
    .from("images")
    .upload(filename, file, {
      cacheControl: "3600",
      upsert: false,
    });
    
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage.from("images").getPublicUrl(filename);
  
  return publicUrl;
}

async function generateSumitReceipt(orderId: number) {
  try {
    const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).single();
    if (orderError || !order) return;
    
    const { data: items, error: itemsError } = await supabase.from("order_items").select("*").eq("order_id", orderId);
    if (itemsError || !items) return;

    const { data: sumitCompanyId } = await supabase.from("settings").select("value").eq("key", "sumit_company_id").maybeSingle();
    const { data: sumitApiKey } = await supabase.from("settings").select("value").eq("key", "sumit_api_key").maybeSingle();

    if (!sumitCompanyId?.value || !sumitApiKey?.value) {
      console.log('Sumit credentials missing, skipping receipt generation.');
      return;
    }

    const payload = {
      Credentials: {
        CompanyID: parseInt(sumitCompanyId.value),
        APIKey: sumitApiKey.value
      },
      Details: {
        Type: 2, 
        Customer: {
          Name: order.customer_name,
          Phone: order.phone,
          EmailAddress: order.email || ''
        },
        SendByEmail: order.email ? {
          EmailAddress: order.email,
          Original: true
        } : undefined
      },
      Payments: [
        {
          Amount: order.total_amount,
          Type: 6 
        }
      ],
      Items: items.map(item => ({
        Quantity: item.quantity,
        UnitPrice: item.price,
        TotalPrice: item.price * item.quantity,
        Item: {
          Name: item.product_name
        }
      })),
      VATIncluded: true
    };

    const res = await fetch('https://api.sumit.co.il/accounting/documents/create/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log('Sumit Response:', data);

    let docUrl = '';
    if (data?.Data?.DocumentURL) {
      docUrl = data.Data.DocumentURL;
    } else if (data?.Data?.Document?.URL) {
      docUrl = data.Data.Document.URL;
    } else if (data?.Data?.URL) {
      docUrl = data.Data.URL;
    }
    
    if (docUrl) {
      const currentNotes = order.notes || '';
      const newNotes = currentNotes ? currentNotes + '\n[לינק לקבלה: ' + docUrl + ']' : '[לינק לקבלה: ' + docUrl + ']';
      await supabase.from("orders").update({ notes: newNotes }).eq("id", orderId);
    }
  } catch (err) {
    console.error('Failed to generate Sumit receipt:', err);
  }
}
/ /   - - -   F i n a n c i a l   R e p o r t s   - - -  
 e x p o r t   a s y n c   f u n c t i o n   g e t F i n a n c i a l R e p o r t D a t a ( )   {  
     c o n s t   {   d a t a :   o r d e r s ,   e r r o r :   o r d e r s E r r o r   }   =   a w a i t   s u p a b a s e . f r o m ( ' o r d e r s ' ) . s e l e c t ( ' * ' ) . n e q ( ' s t a t u s ' ,   ' ����' ) ;  
     i f   ( o r d e r s E r r o r )   t h r o w   o r d e r s E r r o r ;  
     c o n s t   {   d a t a :   e x p e n s e s ,   e r r o r :   e x p e n s e s E r r o r   }   =   a w a i t   s u p a b a s e . f r o m ( ' e x p e n s e s ' ) . s e l e c t ( ' * ' ) ;  
     i f   ( e x p e n s e s E r r o r )   t h r o w   e x p e n s e s E r r o r ;  
     r e t u r n   {   o r d e r s :   o r d e r s   | |   [ ] ,   e x p e n s e s :   e x p e n s e s   | |   [ ]   } ;  
 }  
 