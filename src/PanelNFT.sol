// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IPanelNFT.sol";

/**
 * @title PanelNFT
 * @notice ERC721-style NFT for energy production panels with metadata and retirement.
 */
contract PanelNFT is IPanelNFT {
    uint256 private _nextTokenId = 1;
    uint256 private _totalSupply;

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    mapping(uint256 => PanelMetadata) private _metadata;

    address public owner;
    mapping(address => bool) public minters;

    error Unauthorized();
    error ZeroAddress();
    error NotOwner();
    error NotApproved();
    error InvalidTokenId();
    error AlreadyRetired();
    error NotRetired();
    error WrongFrom();
    error TransferToZero();
    error NonExistentToken();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyMinter() {
        if (!minters[msg.sender] && msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setMinter(address account, bool granted) external onlyOwner {
        if (account == address(0)) revert ZeroAddress();
        minters[account] = granted;
    }

    function balanceOf(address owner_) external view override returns (uint256) {
        if (owner_ == address(0)) revert ZeroAddress();
        return _balances[owner_];
    }

    function ownerOf(uint256 tokenId) public view override returns (address) {
        address owner_ = _owners[tokenId];
        if (owner_ == address(0)) revert InvalidTokenId();
        return owner_;
    }

    function getApproved(uint256 tokenId) external view override returns (address) {
        if (_owners[tokenId] == address(0)) revert InvalidTokenId();
        return _tokenApprovals[tokenId];
    }

    function isApprovedForAll(address owner_, address operator) external view override returns (bool) {
        return _operatorApprovals[owner_][operator];
    }

    function approve(address to, uint256 tokenId) external override {
        address owner_ = ownerOf(tokenId);
        if (to == owner_) revert Unauthorized();
        if (msg.sender != owner_ && !_operatorApprovals[owner_][msg.sender]) revert NotApproved();
        _tokenApprovals[tokenId] = to;
        emit Approval(owner_, to, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) external override {
        if (operator == address(0)) revert ZeroAddress();
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address owner_ = _owners[tokenId];
        return (spender == owner_ || _tokenApprovals[tokenId] == spender || _operatorApprovals[owner_][spender]);
    }

    function transferFrom(address from, address to, uint256 tokenId) public override {
        if (to == address(0)) revert TransferToZero();
        if (_owners[tokenId] != from) revert WrongFrom();
        if (!_isApprovedOrOwner(msg.sender, tokenId)) revert NotApproved();
        if (_metadata[tokenId].isActive == false) revert AlreadyRetired();

        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;
        delete _tokenApprovals[tokenId];
        emit Transfer(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) external override {
        _safeTransferFrom(from, to, tokenId, bytes(""));
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) public override {
        _safeTransferFrom(from, to, tokenId, data);
    }

    function _safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) internal {
        transferFrom(from, to, tokenId);
        if (to.code.length > 0) {
            bytes4 selector = 0x150b7a02; // onERC721Received(address,address,uint256,bytes)
            (bool ok, bytes memory ret) = to.call(abi.encodeWithSignature("onERC721Received(address,address,uint256,bytes)", msg.sender, from, tokenId, data));
            if (!ok || ret.length != 32 || abi.decode(ret, (bytes4)) != selector) revert("ERC721: safe transfer to non-receiver");
        }
    }

    function mint(address to, string calldata metadataUri, uint256 capacityWatt) external override onlyMinter returns (uint256) {
        if (to == address(0)) revert ZeroAddress();
        uint256 tokenId = _nextTokenId++;
        _totalSupply += 1;
        _owners[tokenId] = to;
        _balances[to] += 1;
        _metadata[tokenId] = PanelMetadata({
            tokenId: tokenId,
            metadataUri: metadataUri,
            capacityWatt: capacityWatt,
            installationTimestamp: block.timestamp,
            isActive: true
        });
        emit Transfer(address(0), to, tokenId);
        emit PanelMinted(to, tokenId, metadataUri);
        return tokenId;
    }

    function retire(uint256 tokenId) external override {
        address owner_ = ownerOf(tokenId);
        if (msg.sender != owner_ && !_operatorApprovals[owner_][msg.sender] && _tokenApprovals[tokenId] != msg.sender) revert NotApproved();
        if (!_metadata[tokenId].isActive) revert AlreadyRetired();
        _metadata[tokenId].isActive = false;
        emit PanelRetired(tokenId);
    }

    function getPanelMetadata(uint256 tokenId) external view override returns (PanelMetadata memory) {
        if (_owners[tokenId] == address(0)) revert InvalidTokenId();
        return _metadata[tokenId];
    }

    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }
}
