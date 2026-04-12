// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ProductPayment
 * @dev Smart Contract untuk menerima pembayaran produk dengan ETH
 * @notice Contract ini digunakan untuk Virtual Product Gallery Web3
 */
contract ProductPayment {
    // Owner contract (yang deploy)
    address public owner;
    
    // Struct untuk menyimpan data pembayaran
    struct Payment {
        address buyer;          // Alamat pembeli
        uint256 amount;         // Jumlah ETH yang dibayar
        uint256 productId;      // ID produk (dari database)
        uint256 timestamp;      // Waktu pembayaran
    }
    
    // Mapping untuk menyimpan semua pembayaran
    mapping(uint256 => Payment) public payments;
    uint256 public paymentCount;
    
    // Event yang di-emit saat ada pembayaran
    event PaymentReceived(
        uint256 indexed paymentId,
        address indexed buyer,
        uint256 amount,
        uint256 productId,
        uint256 timestamp
    );
    
    // Event saat owner withdraw
    event Withdrawn(address indexed owner, uint256 amount);
    
    // Modifier untuk memastikan hanya owner yang bisa akses
    modifier onlyOwner() {
        require(msg.sender == owner, "Hanya owner yang bisa akses");
        _;
    }
    
    // Constructor - set owner saat deploy
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Fungsi untuk membayar produk dengan ETH
     * @param _productId ID produk yang dibeli (dari database)
     */
    function payProduct(uint256 _productId) public payable {
        require(msg.value > 0, "Jumlah pembayaran harus lebih dari 0");
        
        // Simpan data pembayaran
        paymentCount++;
        payments[paymentCount] = Payment({
            buyer: msg.sender,
            amount: msg.value,
            productId: _productId,
            timestamp: block.timestamp
        });
        
        // Emit event
        emit PaymentReceived(
            paymentCount,
            msg.sender,
            msg.value,
            _productId,
            block.timestamp
        );
    }
    
    /**
     * @dev Fungsi untuk owner withdraw semua ETH dari contract
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "Tidak ada balance untuk di-withdraw");
        
        // Transfer semua ETH ke owner
        (bool success, ) = owner.call{value: balance}("");
        require(success, "Transfer gagal");
        
        emit Withdrawn(owner, balance);
    }
    
    /**
     * @dev Fungsi untuk cek balance contract
     */
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Fungsi untuk ambil detail pembayaran
     */
    function getPayment(uint256 _paymentId) public view returns (
        address buyer,
        uint256 amount,
        uint256 productId,
        uint256 timestamp
    ) {
        Payment memory payment = payments[_paymentId];
        return (
            payment.buyer,
            payment.amount,
            payment.productId,
            payment.timestamp
        );
    }
    
    /**
     * @dev Fungsi untuk transfer ownership
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Owner baru tidak valid");
        owner = newOwner;
    }
    
    // Fallback function untuk menerima ETH langsung
    receive() external payable {
        emit PaymentReceived(
            0,
            msg.sender,
            msg.value,
            0,
            block.timestamp
        );
    }
}
