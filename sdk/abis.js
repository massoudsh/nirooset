/**
 * Minimal ABIs for GRIDSET contracts. For full ABIs use forge build output.
 */
export const energyTokenAbi = [
  { inputs: [{ name: 'account', type: 'address' }], name: 'balanceOf', outputs: [{ type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ name: 'account', type: 'address' }], name: 'getEnergyBalance', outputs: [{ components: [{ name: 'total', type: 'uint256' }, { name: 'locked', type: 'uint256' }, { name: 'available', type: 'uint256' }], type: 'tuple' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'totalSupply', outputs: [{ type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], name: 'transfer', outputs: [{ type: 'bool' }], stateMutability: 'nonpayable', type: 'function' },
]

const orderStruct = { components: [{ name: 'orderId', type: 'uint256' }, { name: 'trader', type: 'address' }, { name: 'isBid', type: 'bool' }, { name: 'price', type: 'uint256' }, { name: 'quantity', type: 'uint256' }, { name: 'filledQuantity', type: 'uint256' }, { name: 'timeSlot', type: 'uint256' }, { name: 'isActive', type: 'bool' }], type: 'tuple' }
const auctionStruct = { components: [{ name: 'timeSlot', type: 'uint256' }, { name: 'startTime', type: 'uint256' }, { name: 'endTime', type: 'uint256' }, { name: 'clearingPrice', type: 'uint256' }, { name: 'totalBidQuantity', type: 'uint256' }, { name: 'totalAskQuantity', type: 'uint256' }, { name: 'isCleared', type: 'bool' }], type: 'tuple' }

export const energyMarketAbi = [
  { inputs: [{ name: 'timeSlot', type: 'uint256' }], name: 'getAuction', outputs: [auctionStruct], stateMutability: 'view', type: 'function' },
  { inputs: [{ name: 'timeSlot', type: 'uint256' }], name: 'getBestBid', outputs: [{ name: 'price', type: 'uint256' }, { name: 'quantity', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ name: 'timeSlot', type: 'uint256' }], name: 'getBestAsk', outputs: [{ name: 'price', type: 'uint256' }, { name: 'quantity', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ name: 'timeSlot', type: 'uint256' }], name: 'getOrderBook', outputs: [{ type: 'tuple[]', components: orderStruct.components }, { type: 'tuple[]', components: orderStruct.components }], stateMutability: 'view', type: 'function' },
  { inputs: [{ name: 'timeSlot', type: 'uint256' }, { name: 'price', type: 'uint256' }, { name: 'quantity', type: 'uint256' }], name: 'placeBid', outputs: [{ type: 'uint256' }], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ name: 'timeSlot', type: 'uint256' }, { name: 'price', type: 'uint256' }, { name: 'quantity', type: 'uint256' }], name: 'placeAsk', outputs: [{ type: 'uint256' }], stateMutability: 'nonpayable', type: 'function' },
  { type: 'event', name: 'AuctionCleared', inputs: [{ name: 'timeSlot', type: 'uint256', indexed: true }, { name: 'clearingPrice', type: 'uint256', indexed: false }, { name: 'totalQuantity', type: 'uint256', indexed: false }] },
  { type: 'event', name: 'OrderPlaced', inputs: [{ name: 'orderId', type: 'uint256', indexed: true }, { name: 'trader', type: 'address', indexed: true }, { name: 'isBid', type: 'bool', indexed: false }, { name: 'price', type: 'uint256', indexed: false }, { name: 'quantity', type: 'uint256', indexed: false }] },
]

export const stakingVaultAbi = [
  { inputs: [], name: 'getTotalStaked', outputs: [{ type: 'uint256' }], stateMutability: 'view', type: 'function' },
]
