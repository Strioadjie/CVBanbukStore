// Check if Midtrans is configured
export function isMidtransConfigured(): boolean {
  return !!(
    process.env.MIDTRANS_SERVER_KEY &&
    process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY &&
    process.env.MIDTRANS_SERVER_KEY !== 'your-server-key' &&
    process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY !== 'your-client-key'
  );
}

// Lazy initialization - only create when needed and configured
let snapInstance: any = null;
let coreApiInstance: any = null;

async function getMidtransClient() {
  const mod = await import("midtrans-client");
  return mod.default ?? mod;
}

async function getSnap() {
  if (!isMidtransConfigured()) {
    throw new Error('Midtrans belum dikonfigurasi. Silakan setup MIDTRANS_SERVER_KEY dan MIDTRANS_CLIENT_KEY di .env');
  }
  
  if (!snapInstance) {
    const midtransClient = await getMidtransClient();
    snapInstance = new midtransClient.Snap({
      isProduction: false, // Set true untuk production
      serverKey: process.env.MIDTRANS_SERVER_KEY || '',
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '',
    });
  }
  return snapInstance;
}

async function getCoreApi() {
  if (!isMidtransConfigured()) {
    throw new Error('Midtrans belum dikonfigurasi');
  }
  
  if (!coreApiInstance) {
    const midtransClient = await getMidtransClient();
    coreApiInstance = new midtransClient.CoreApi({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY || '',
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '',
    });
  }
  return coreApiInstance;
}

export const snap = { get: getSnap };
export const coreApi = { get: getCoreApi };

// Helper function untuk create transaction
export async function createMidtransTransaction(params: {
  orderId: string;
  amount: number;
  customerDetails: {
    firstName: string;
    email: string;
    phone?: string;
  };
  itemDetails: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}) {
  // Check if configured
  if (!isMidtransConfigured()) {
    return {
      success: false,
      error: 'Midtrans belum dikonfigurasi. Silakan hubungi administrator untuk setup payment gateway.',
    };
  }
  
  const parameter = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: params.amount,
    },
    customer_details: {
      first_name: params.customerDetails.firstName,
      email: params.customerDetails.email,
      phone: params.customerDetails.phone || '',
    },
    item_details: params.itemDetails,
    credit_card: {
      secure: true,
    },
  };

  try {
    const snapApi = await getSnap();
    const transaction = await snapApi.createTransaction(parameter);
    return {
      success: true,
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
    };
  } catch (error: any) {
    console.error('Midtrans error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create transaction',
    };
  }
}

// Helper function untuk check transaction status
export async function checkTransactionStatus(orderId: string) {
  if (!isMidtransConfigured()) {
    return {
      success: false,
      error: 'Midtrans belum dikonfigurasi',
    };
  }

  try {
    const api = await getCoreApi();
    const status = await api.transaction.status(orderId);
    return {
      success: true,
      data: status,
    };
  } catch (error: any) {
    console.error('Midtrans status check error:', error);
    return {
      success: false,
      error: error.message || 'Failed to check status',
    };
  }
}
