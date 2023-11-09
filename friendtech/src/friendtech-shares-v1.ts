import { BigInt } from '@graphprotocol/graph-ts';
import { Trade as TradeEvent } from '../generated/FriendtechSharesV1/FriendtechSharesV1';
import { Trade } from '../generated/schema';
import { createOrLoadSubject } from './helpers';

export function handleTrade(event: TradeEvent): void {
  /**
   * Load or create Subject entity first
   */
  let subject = createOrLoadSubject(event.params.subject);

  /**
   * Create Trade entity and set the foreign key to Subject
   */
  let trade = new Trade(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  trade.trader = event.params.trader;
  trade.subject = subject.id; // Set the foreign key to Subject's ID
  trade.isBuy = event.params.isBuy;
  trade.shareAmount = event.params.shareAmount;
  trade.ethAmount = event.params.ethAmount;
  trade.protocolEthAmount = event.params.protocolEthAmount;
  trade.subjectEthAmount = event.params.subjectEthAmount;
  trade.supply = event.params.supply;

  trade.blockNumber = event.block.number;
  trade.blockTimestamp = event.block.timestamp;
  trade.transactionHash = event.transaction.hash;

  trade.save();

  /**
   * Update Subject entity based on the trade event
   */
  subject.earnedFees = subject.earnedFees.plus(event.params.subjectEthAmount);
  subject.trades = subject.trades.plus(BigInt.fromI32(1));
  subject.tradedShares = subject.tradedShares.plus(event.params.shareAmount);

  subject.save();
}
