# Dokumentasi UML Lengkap - CV Banbuk Store

Dokumen ini berisi spesifikasi UML (Unified Modeling Language) lengkap untuk sistem **CV Banbuk Store** (Virtual Product Gallery Web3). Semua diagram di bawah ini didefinisikan menggunakan format **Mermaid** sehingga dapat langsung dirender secara visual di GitHub, editor markdown modern, atau previewer Mermaid.

---

## 1. Use Case Diagram

Diagram Use Case menggambarkan interaksi antara aktor (pengguna manusia dan sistem eksternal) dengan use case (fitur) yang disediakan oleh sistem CV Banbuk Store.

```mermaid
graph TB
    subgraph Sistem CV Banbuk Store
        UC1((Register Akun))
        UC2((Login Multi-Role))
        UC3((Lihat Katalog & Detail Produk))
        UC4((Bandingkan Produk))
        UC5((Kelola Wishlist))
        UC6((Kelola Keranjang Lokal))
        UC7((Buat Inquiry Baru))
        UC8((Assign Inquiry ke Sales))
        UC9((Update Status Inquiry))
        UC10((CRUD Produk))
        UC11((Pilih Metode Pembayaran))
        UC12((Bayar via Midtrans Gateway))
        UC13((Bayar via Crypto Ethereum))
        UC14((Bayar via Manual/Simulasi))
        UC15((Lihat Dashboard & Statistik))
        UC16((Export Laporan CSV/PDF))
    end

    Admin[Aktor: Admin]
    Sales[Aktor: Sales]
    Customer[Aktor: Customer]
    Guest[Aktor: Guest]
    
    Midtrans[Sistem Eksternal: Midtrans]
    MetaMask[Sistem Eksternal: MetaMask / Web3]

    %% Hubungan Guest
    Guest --> UC3
    Guest --> UC4
    Guest --> UC6

    %% Hubungan Customer
    Customer --> UC1
    Customer --> UC2
    Customer --> UC3
    Customer --> UC4
    Customer --> UC5
    Customer --> UC6
    Customer --> UC7
    Customer --> UC11
    Customer --> UC12
    Customer --> UC13
    Customer --> UC14
    Customer --> UC15

    %% Hubungan Sales
    Sales --> UC2
    Sales --> UC3
    Sales --> UC9
    Sales --> UC15

    %% Hubungan Admin
    Admin --> UC2
    Admin --> UC3
    Admin --> UC8
    Admin --> UC10
    Admin --> UC15
    Admin --> UC16

    %% Hubungan Sistem Eksternal
    UC12 --> Midtrans
    UC13 --> MetaMask
```

### Deskripsi Aktor & Hak Akses
1. **Guest**: Pengguna yang belum login. Hanya dapat mencari, melihat, membandingkan produk, dan memasukkan produk ke keranjang lokal (`localStorage`).
2. **Customer**: Pengguna terdaftar (pembeli). Memiliki akses ke fitur transaksi (wishlist, checkout, inquiry, riwayat pembelian, pembayaran).
3. **Sales**: Staf penjualan. Bertanggung jawab memproses inquiry yang ditugaskan kepadanya, menghubungi customer via WhatsApp, dan memperbarui status inquiry.
4. **Admin**: Pengelola sistem. Bertanggung jawab mengelola produk (CRUD), memantau statistik, menugaskan inquiry ke sales, melihat user, dan mengunduh laporan.
5. **Midtrans (Sistem Eksternal)**: Gerbang pembayaran gateway untuk pemrosesan kartu/e-wallet/QRIS.
6. **MetaMask / Ethereum Network (Sistem Eksternal)**: Wallet dan blockchain network untuk pemrosesan transaksi crypto on-chain.

---

## 2. Class Diagram

Diagram kelas menunjukkan struktur statis sistem dengan mendefinisikan kelas-kelas entitas database, controller/API routes, dan integrasi eksternal beserta relasi dan operasinya.

```mermaid
classDiagram
    class User {
        +String id
        +String email
        +String password
        +String name
        +String role
        +DateTime createdAt
        +DateTime updatedAt
        +register()
        +login()
    }
    class Product {
        +String id
        +String name
        +Float price
        +Int stock
        +String description
        +String material
        +String size
        +String image
        +DateTime createdAt
        +DateTime updatedAt
        +create()
        +update()
        +delete()
        +getAll()
        +getById()
    }
    class Inquiry {
        +String id
        +String productId
        +String userId
        +String assignedTo
        +String status
        +String message
        +DateTime createdAt
        +DateTime updatedAt
        +create()
        +assignSales()
        +updateStatus()
    }
    class Wishlist {
        +String id
        +String userId
        +String productId
        +DateTime createdAt
        +add()
        +remove()
    }
    class Transaction {
        +String id
        +String userId
        +String productId
        +Float amount
        +String paymentType
        +String txHash
        +String walletAddress
        +String status
        +DateTime createdAt
        +DateTime updatedAt
        +createTransaction()
        +updateStatus()
    }

    class NextAuth {
        +signIn()
        +signOut()
        +getServerSession()
    }

    class PrismaClient {
        +user
        +product
        +inquiry
        +wishlist
        +transaction
    }

    class MidtransService {
        +createTransaction()
        +status()
    }

    class ProductPaymentContract {
        +address owner
        +payProduct()
        +withdraw()
        +getBalance()
    }

    User "1" --> "*" Inquiry : makes
    User "1" --> "*" Wishlist : saves
    User "1" --> "*" Transaction : pays
    Inquiry "*" --> "0..1" User : assignedTo (Sales)
    
    Product "1" --> "*" Inquiry : queried
    Product "1" --> "*" Wishlist : addedTo
    Product "1" --> "*" Transaction : purchased
    
    Inquiry --> PrismaClient : db access
    Transaction --> PrismaClient : db access
    User --> NextAuth : authenticated by
    
    Transaction --> MidtransService : process gateway
    Transaction --> ProductPaymentContract : process crypto
```

---

## 3. Sequence Diagram - Registrasi Customer

Alur registrasi akun pembeli secara mandiri melalui form publik. Pendaftaran default menghasilkan akun dengan role `CUSTOMER`.

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Frontend as Register Page
    participant API as Register API Route (/api/auth/register)
    participant DB as Prisma (Database)
    
    Customer->>Frontend: Input Nama, Email, Password
    Customer->>Frontend: Klik Register
    Frontend->>API: POST /api/auth/register {name, email, password}
    activate API
    API->>DB: User.findUnique({ where: { email } })
    activate DB
    DB-->>API: null (Email belum terdaftar)
    deactivate DB
    API->>API: Hash password (bcrypt)
    API->>DB: User.create({ name, email, role: "CUSTOMER", passwordHash })
    activate DB
    DB-->>API: User object (id, name, email, role)
    deactivate DB
    API-->>Frontend: HTTP 201 Registration Success {message, userId}
    deactivate API
    Frontend-->>Customer: Redirect ke /login dengan notifikasi sukses
```

---

## 4. Sequence Diagram - Login Multi-Role

Alur masuk ke aplikasi menggunakan NextAuth dengan pencocokan kredensial yang tersimpan di database.

```mermaid
sequenceDiagram
    autonumber
    actor User as Admin / Sales / Customer
    participant UI as Login Page
    participant NextAuth as NextAuth.js
    participant DB as Prisma (Database)
    
    User->>UI: Input Email & Password
    User->>UI: Klik Login
    UI->>NextAuth: signIn("credentials", { email, password })
    activate NextAuth
    NextAuth->>NextAuth: authorize() callback
    NextAuth->>DB: User.findUnique({ where: { email } })
    activate DB
    DB-->>NextAuth: User Record (id, email, passwordHash, role, name)
    deactivate DB
    NextAuth->>NextAuth: Compare Password (bcrypt.compare)
    Note over NextAuth: Password Valid?
    alt Password Valid
        NextAuth->>NextAuth: Generate JWT Session Token (id, email, role, name)
        NextAuth-->>UI: Sign In Success (Redirect to /dashboard)
        UI-->>User: Redirect ke Dashboard sesuai role masing-masing
    else Password Invalid
        NextAuth-->>UI: Sign In Failed (Error "CredentialsSignin")
        deactivate NextAuth
        UI-->>User: Tampilkan error "Email atau password salah"
    end
```

---

## 5. Sequence Diagram - Manajemen Inquiry

Proses lengkap dari pembuatan inquiry oleh customer, penugasan sales oleh admin, hingga tindak lanjut dan penutupan inquiry oleh sales.

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    actor Admin
    actor Sales
    participant Frontend as App UI
    participant API as API Routes (/api/inquiry)
    participant DB as Prisma (Database)

    %% Skenario A: Pembuatan Inquiry oleh Customer
    Note over Customer, DB: Skenario A: Pembuatan Inquiry
    Customer->>Frontend: Lihat Detail Produk, Klik "Buka Inquiry"
    Customer->>Frontend: Tulis pesan tambahan & submit
    Frontend->>API: POST /api/inquiry {productId, message}
    activate API
    API->>API: Validasi Session (Role = CUSTOMER)
    API->>DB: Inquiry.create({ userId, productId, message, status: "PENDING" })
    activate DB
    DB-->>API: Inquiry created
    deactivate DB
    API-->>Frontend: HTTP 201 Success
    deactivate API
    Frontend-->>Customer: Tampilkan pesan sukses & update halaman inquiry

    %% Skenario B: Assignment oleh Admin
    Note over Admin, DB: Skenario B: Assignment ke Sales
    Admin->>Frontend: Buka Dashboard Admin -> Daftar Inquiry
    Frontend->>API: GET /api/inquiry (Ambil semua inquiry)
    API->>DB: Inquiry.findMany()
    DB-->>API: List inquiry
    API-->>Frontend: Render tabel inquiry
    Admin->>Frontend: Pilih Sales & klik "Assign Sales"
    Frontend->>API: PUT /api/inquiry/{inquiryId} {assignedTo: salesId}
    activate API
    API->>API: Validasi Session (Role = ADMIN)
    API->>DB: Inquiry.update({ where: { id }, data: { assignedTo } })
    activate DB
    DB-->>API: Inquiry updated
    deactivate DB
    API-->>Frontend: HTTP 200 Success (Inquiry updated)
    deactivate API
    Frontend-->>Admin: Update display (Sales assigned)

    %% Skenario C: Progres & Resolution oleh Sales
    Note over Sales, DB: Skenario C: Progres & Resolution
    Sales->>Frontend: Buka Dashboard Sales -> Inquiry Assigned
    Frontend->>API: GET /api/inquiry (Filter: assignedTo = salesId)
    API->>DB: Inquiry.findMany({ where: { assignedTo } })
    DB-->>API: List inquiry assigned
    API-->>Frontend: Tampilkan daftar
    Sales->>Frontend: Klik tombol WhatsApp (Hubungi customer)
    Note over Sales, Frontend: Membuka link wa.me dengan template chat otomatis
    Sales->>Frontend: Ubah status ke "DIPROSES" / "SELESAI"
    Frontend->>API: PUT /api/inquiry/{inquiryId} {status: "SELESAI"}
    activate API
    API->>API: Validasi Session (Role = SALES & assignedTo = salesId)
    API->>DB: Inquiry.update({ where: { id }, data: { status } })
    activate DB
    DB-->>API: Inquiry updated
    deactivate DB
    API-->>Frontend: HTTP 200 Success
    deactivate API
    Frontend-->>Sales: Tampilkan status terupdate (Selesai)
```

---

## 6. Sequence Diagram - Manajemen Wishlist

Proses menambahkan produk ke daftar favorit customer dan menghapusnya kembali.

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant UI as Product Catalog
    participant API as Wishlist API (/api/wishlist)
    participant DB as Prisma (Database)
    
    %% Tambah Wishlist
    Note over Customer, DB: Skenario 1: Menambahkan ke Wishlist
    Customer->>UI: Klik ikon Wishlist/Simpan pada produk
    UI->>API: POST /api/wishlist {productId}
    activate API
    API->>API: Validasi Session (Role = CUSTOMER)
    API->>DB: Wishlist.findUnique({ where: { userId_productId } })
    activate DB
    DB-->>API: null (Belum ada)
    deactivate DB
    API->>DB: Wishlist.create({ userId, productId })
    activate DB
    DB-->>API: Wishlist Record
    deactivate DB
    API-->>UI: HTTP 201 Success
    deactivate API
    UI-->>Customer: Tampilkan feedback "Tersimpan di wishlist"
    
    %% Hapus Wishlist
    Note over Customer, DB: Skenario 2: Menghapus dari Wishlist
    Customer->>UI: Klik hapus/batal wishlist
    UI->>API: DELETE /api/wishlist?productId={productId}
    activate API
    API->>API: Validasi Session (Role = CUSTOMER)
    API->>DB: Wishlist.deleteMany({ where: { userId, productId } })
    activate DB
    DB-->>API: Delete confirmation
    deactivate DB
    API-->>UI: HTTP 200 Success
    deactivate API
    UI-->>Customer: Tampilkan feedback "Dihapus dari wishlist"
```

---

## 7. Sequence Diagram - Pembayaran Midtrans Gateway

Alur lengkap pembayaran produk oleh customer menggunakan gateway Midtrans Snap hingga proses callback / webhook pemberitahuan status transaksi.

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant UI as Checkout / Payment Page
    participant API as Midtrans API (/api/payment/midtrans/create)
    participant DB as Prisma (Database)
    participant Midtrans as Midtrans Snap Server
    participant Webhook as Webhook API (/api/payment/midtrans/notification)
    
    Customer->>UI: Pilih Pembayaran Gateway (Midtrans) & Klik Bayar
    UI->>API: POST /api/payment/midtrans/create {productId}
    activate API
    API->>DB: Product.findUnique({ where: { id: productId } })
    activate DB
    DB-->>API: Product Record (price, stock)
    deactivate DB
    Note over API: Cek stok (stock >= 1)
    API->>API: Generate orderId (ORDER-timestamp-uid)
    API->>DB: Transaction.create({ id: orderId, userId, productId, amount: price, paymentType: "MIDTRANS", status: "PENDING" })
    activate DB
    DB-->>API: Transaction saved
    deactivate DB
    API->>Midtrans: Request Snap Token (amount, orderId, customerDetails)
    activate Midtrans
    Midtrans-->>API: Response {token, redirectUrl}
    deactivate Midtrans
    API-->>UI: HTTP 200 Success {token, redirectUrl, orderId}
    deactivate API
    
    UI->>UI: Load Midtrans Snap JS & panggil snap.pay(token)
    UI-->>Customer: Tampilkan Snap Popup (Metode bayar QRIS/Bank Transfer/E-Wallet)
    Customer->>Midtrans: Bayar sesuai metode terpilih
    
    %% Webhook Notification
    Note over Midtrans, Webhook: Proses Webhook Notifikasi Pembayaran (Asynchronous)
    Midtrans->>Webhook: POST Webhook Notification {order_id, status_code, signature_key, transaction_status}
    activate Webhook
    Webhook->>Webhook: Validasi Signature Key (SHA512 hashing server_key)
    Webhook->>Midtrans: GET Check Status (order_id)
    activate Midtrans
    Midtrans-->>Webhook: Detail status (settlement / capture)
    deactivate Midtrans
    Webhook->>DB: Transaction.update({ where: { id: order_id }, data: { status: "COMPLETED" } })
    activate DB
    DB-->>Webhook: Transaction updated
    deactivate DB
    Webhook->>DB: Product.update({ decrement stock by 1 })
    activate DB
    DB-->>Webhook: Stock updated
    deactivate DB
    Webhook-->>Midtrans: HTTP 200 OK
    deactivate Webhook
    
    %% Customer redirect
    UI-->>Customer: Redirect ke /dashboard (Status: Pembayaran gateway selesai)
```

---

## 8. Sequence Diagram - Pembayaran Crypto Ethereum

Proses checkout menggunakan integrasi web3, interaksi MetaMask client-side dengan smart contract Solidity untuk pengiriman ETH, dan pencatatan on-chain.

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant UI as Web3Payment Component
    participant MetaMask as MetaMask / Web3 Provider
    participant Contract as Smart Contract (ProductPayment.sol)
    participant API as Transaction API (/api/transaction)
    participant DB as Prisma (Database)
    
    Customer->>UI: Pilih Pembayaran Crypto ETH
    UI->>MetaMask: Request Account Access (eth_requestAccounts)
    activate MetaMask
    MetaMask-->>UI: Return Account Address & Enable Provider
    deactivate MetaMask
    
    Customer->>UI: Klik "Bayar dengan ETH"
    UI->>MetaMask: Send Transaction to payProduct(productIdHash)
    activate MetaMask
    MetaMask->>Customer: Minta Approval Gas Fee & Total ETH (0.001 ETH)
    Customer->>MetaMask: Setujui Transaksi (Approve)
    MetaMask->>Contract: payProduct(productIdHash) {value: 0.001 ETH}
    activate Contract
    Contract->>Contract: Simpan struct Payment & emit event PaymentReceived
    Contract-->>MetaMask: Transaction receipt (txHash)
    deactivate Contract
    MetaMask-->>UI: Return Transaction Hash (txHash)
    deactivate MetaMask
    
    UI->>API: POST /api/transaction {productId, paymentType: "CRYPTO", txHash, walletAddress}
    activate API
    API->>DB: Product.findUnique({ where: { id: productId } })
    activate DB
    DB-->>API: Product Record (price, stock)
    deactivate DB
    API->>DB: Transaction.create({ userId, productId, amount, paymentType: "CRYPTO", txHash, walletAddress, status: "COMPLETED" })
    activate DB
    DB-->>API: Transaction saved
    deactivate DB
    API->>DB: Product.update({ decrement stock by 1 })
    activate DB
    DB-->>API: Stock updated
    deactivate DB
    API-->>UI: HTTP 201 Success
    deactivate API
    UI-->>Customer: Tampilkan notifikasi berhasil & redirect ke /dashboard
```

---

## 9. Activity Diagram - Pembelian & Pembayaran Produk

Aktivitas sistem secara sekuensial dan paralel dari masuknya customer, pemilihan produk, pemilihan salah satu dari 3 tipe pembayaran, hingga pencatatan transaksi dan pengurangan stok.

```mermaid
stateDiagram-v2
    [*] --> LoginState : Customer Login
    LoginState --> BrowseCatalog : Buka Katalog Produk
    BrowseCatalog --> SelectProduct : Pilih Produk & Lihat Detail
    SelectProduct --> SelectPayment : Klik Checkout & Pilih Metode Pembayaran
    
    state SelectPayment {
        [*] --> DecisionPayment
        DecisionPayment --> ManualPay : Manual
        DecisionPayment --> MidtransPay : Midtrans
        DecisionPayment --> CryptoPay : Crypto (ETH)
    }

    state ManualPay {
        [*] --> SaveManualTx : Buat Transaksi "COMPLETED"
        SaveManualTx --> DecrStockManual : Kurangi Stok Produk
    }

    state MidtransPay {
        [*] --> CreateMidtransTx : Buat Transaksi "PENDING"
        CreateMidtransTx --> GetSnapToken : Request Token ke Midtrans Snap
        GetSnapToken --> ShowSnapUI : Tampilkan Popup Snap
        ShowSnapUI --> UserPaysMidtrans : Customer Selesaikan Pembayaran
        UserPaysMidtrans --> MidtransWebhook : Midtrans Kirim Webhook Notification
        MidtransWebhook --> VerifyWebhookSig : Validasi Signature Webhook
        VerifyWebhookSig --> UpdateTxMidtrans : Update Transaksi ke "COMPLETED"
        UpdateTxMidtrans --> DecrStockMidtrans : Kurangi Stok Produk
    }

    state CryptoPay {
        [*] --> ConnectMetaMask : Hubungkan MetaMask Wallet
        ConnectMetaMask --> VerifyNetwork : Validasi Network (Sepolia/Ethereum)
        VerifyNetwork --> BlockchainTx : Kirim Transaksi payProduct() ke Smart Contract
        BlockchainTx --> ApproveMetaMask : Customer Approve di MetaMask
        ApproveMetaMask --> WaitReceipt : Tunggu Konfirmasi Blok (Receipt)
        WaitReceipt --> SaveCryptoTx : Kirim POST /api/transaction "COMPLETED"
        SaveCryptoTx --> DecrStockCrypto : Kurangi Stok Produk
    }

    ManualPay --> ShowSuccess : Selesai
    MidtransPay --> ShowSuccess : Selesai
    CryptoPay --> ShowSuccess : Selesai

    ShowSuccess --> [*] : Tampilkan Detail Pembayaran Sukses di /dashboard
```

---

## 10. State Diagram - Transisi Status Inquiry

Perubahan status pada data inquiry yang dikirim oleh customer dari pertama kali dibuat hingga diselesaikan oleh sales.

```mermaid
stateDiagram-v2
    [*] --> PENDING : Customer membuat inquiry
    
    state PENDING {
        [*] --> AssignedByAdmin : Admin melakukan assignment sales
        AssignedByAdmin --> [*]
    }
    
    PENDING --> DIPROSES : Sales mulai follow-up via WA
    DIPROSES --> SELESAI : Masalah/pertanyaan customer terjawab
    PENDING --> SELESAI : Ditutup langsung oleh sales/admin
    
    SELESAI --> [*]
```

---

## 11. State Diagram - Transisi Status Transaksi

Perubahan status pembayaran dari inisiasi awal (pending) hingga penyelesaian (completed) atau pembatalan (failed).

```mermaid
stateDiagram-v2
    [*] --> PENDING : Order dibuat (Midtrans)
    
    PENDING --> COMPLETED : Webhook Midtrans menerima Settlement/Capture Accept
    PENDING --> FAILED : Webhook Midtrans menerima Cancel/Deny/Expire
    
    [*] --> COMPLETED : Pembayaran manual langsung diproses
    [*] --> COMPLETED : Resi blockchain terkonfirmasi (Crypto ETH)
    
    COMPLETED --> [*]
    FAILED --> [*]
```

---

## 12. Component Diagram

Menunjukkan pembagian komponen software pada browser client, server Next.js, database, smart contract, serta API eksternal yang saling terhubung.

```mermaid
graph TB
    subgraph Browser Node
        UI[UI Pages: Next.js App Client Components]
        LocalCart[Local Storage: banbuk-cart]
        LocalCompare[Local Storage: compare-products]
        MetaMask[MetaMask Extension]
        SnapJS[Midtrans Snap JS SDK]
    end

    subgraph Server Node (Next.js Application)
        AppRoutes[App API Routes]
        NextAuth[NextAuth.js Configuration]
        MidtransCore[Midtrans Core API Helper]
        Prisma[Prisma ORM Client]
    end

    subgraph Database Node
        DB[(PostgreSQL Database)]
    end

    subgraph Blockchain Node
        SC[Smart Contract: ProductPayment.sol]
    end

    subgraph External Services
        MidtransGateway[Midtrans Snap & Core Service]
    end

    %% Client Interactions
    UI --> LocalCart
    UI --> LocalCompare
    UI --> MetaMask
    UI --> SnapJS

    %% Web to API Client Calls
    UI -- HTTPS Requests --> AppRoutes
    SnapJS -- Payment Tokens --> MidtransGateway
    MetaMask -- Web3 RPC calls --> SC

    %% API Interactions
    AppRoutes --> NextAuth
    AppRoutes --> MidtransCore
    AppRoutes --> Prisma

    %% Database
    Prisma --> DB

    %% External System interactions
    MidtransCore -- API Calls / Verification --> MidtransGateway
    MidtransGateway -- Webhooks Notification --> AppRoutes
```

---

## 13. Deployment Diagram

Menunjukkan arsitektur fisik tempat software dideploy dan dijalankan, lengkap dengan protokol komunikasi antar node.

```mermaid
deploymentDiagram
    node ClientDevice as "Client Device / Web Browser" {
        artifact FrontendApp as "React App (Client Bundles)"
        node BrowserEnv as "MetaMask & Snap JS Runtime"
    }

    node VercelServer as "Application Server Node (Vercel Cloud)" {
        node NextJsEE as "Next.js Execution Environment (Node.js)" {
            artifact NextServer as "Next.js Server (API Routes, Server Components)"
            artifact PrismaClient as "Prisma Client ORM"
        }
    }

    node DBServer as "Database Server Node (PostgreSQL Cloud Provider)" {
        node PostgresEE as "PostgreSQL Database Engine" {
            database db as "CV Banbuk DB"
        }
    }

    node MidtransCloud as "Midtrans Gateway Cloud" {
        node SnapEngine as "Midtrans Engine"
    }

    node EthNetwork as "Ethereum Sepolia Network" {
        node EVM as "Ethereum Virtual Machine (EVM)" {
            artifact ProductPayment as "Smart Contract (ProductPayment)"
        }
    }

    %% Network Connections
    ClientDevice -- "HTTPS" --> VercelServer
    VercelServer -- "Direct SSL TCP Connection" --> DBServer
    VercelServer -- "HTTPS REST API" --> MidtransCloud
    ClientDevice -- "Ethereum RPC JSON-RPC" --> EthNetwork
    MidtransCloud -- "HTTPS webhook" --> VercelServer
```
