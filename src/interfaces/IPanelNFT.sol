// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPanelNFT {
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    event PanelMinted(address indexed to, uint256 indexed tokenId, string metadataUri);
    event PanelRetired(uint256 indexed tokenId);

    struct PanelMetadata {
        uint256 tokenId;
        string metadataUri;
        uint256 capacityWatt;
        uint256 installationTimestamp;
        bool isActive;
    }

    function balanceOf(address owner) external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function transferFrom(address from, address to, uint256 tokenId) external;
    function approve(address to, uint256 tokenId) external;
    function setApprovalForAll(address operator, bool approved) external;
    function getApproved(uint256 tokenId) external view returns (address);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
    function mint(address to, string calldata metadataUri, uint256 capacityWatt) external returns (uint256);
    function retire(uint256 tokenId) external;
    function getPanelMetadata(uint256 tokenId) external view returns (PanelMetadata memory);
    function totalSupply() external view returns (uint256);
}
