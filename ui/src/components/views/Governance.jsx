import { useState } from 'react'
import { FileText, CheckCircle, XCircle, Clock, Vote } from 'lucide-react'
import { useWeb3 } from '../../context/Web3Context'
import { useDemo } from '../../context/DemoContext'
import ConfirmActionModal from '../ConfirmActionModal'

export default function Governance() {
  const { isConnected } = useWeb3()
  const { isDemoMode } = useDemo()
  const [proposalTitle, setProposalTitle] = useState('')
  const [proposalDesc, setProposalDesc] = useState('')
  const [votingPeriod, setVotingPeriod] = useState('')
  const [createConfirmOpen, setCreateConfirmOpen] = useState(false)
  const [voteConfirmOpen, setVoteConfirmOpen] = useState(false)
  const [votingProposal, setVotingProposal] = useState(null)
  const [voteFor, setVoteFor] = useState(true)

  const mockProposals = [
    {
      id: 1,
      title: 'Increase Minimum Stake Requirement',
      description: 'Proposal to increase minimum stake from 1,000 to 2,000 GRID tokens',
      proposer: '0x742d...35Cc',
      forVotes: 1250000,
      againstVotes: 320000,
      endTime: '3 days',
      status: 'active',
    },
    {
      id: 2,
      title: 'Update Oracle Reporting Frequency',
      description: 'Change oracle reporting from hourly to 15-minute intervals',
      proposer: '0x8a3f...9Bd2',
      forVotes: 2100000,
      againstVotes: 150000,
      endTime: 'Completed',
      status: 'passed',
    },
    {
      id: 3,
      title: 'Adjust Penalty Rates',
      description: 'Reduce penalty rates for first-time non-performance',
      proposer: '0x5c1e...7F3a',
      forVotes: 0,
      againstVotes: 0,
      endTime: '7 days',
      status: 'active',
    },
  ]

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-energy-yellow/20 text-energy-yellow rounded text-xs font-semibold">Active</span>
      case 'passed':
        return <span className="px-2 py-1 bg-energy-green/20 text-energy-green rounded text-xs font-semibold">Passed</span>
      case 'failed':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-semibold">Failed</span>
      default:
        return null
    }
  }

  const getTotalVotes = (proposal) => proposal.forVotes + proposal.againstVotes
  const getVotePercentage = (votes, total) => total > 0 ? (votes / total * 100).toFixed(1) : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Governance DAO</h2>
        <p className="text-gray-400">Participate in protocol governance and decision-making</p>
      </div>

      {(isConnected || isDemoMode) && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Create Proposal</h3>
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Proposal Title</label>
              <input
                type="text"
                placeholder="Enter proposal title"
                value={proposalTitle}
                onChange={(e) => setProposalTitle(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Description</label>
              <textarea
                placeholder="Describe your proposal..."
                rows="4"
                value={proposalDesc}
                onChange={(e) => setProposalDesc(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Voting Period (days)</label>
              <input
                type="number"
                placeholder="7"
                value={votingPeriod}
                onChange={(e) => setVotingPeriod(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (!proposalTitle.trim()) {
                  alert('Enter a proposal title')
                  return
                }
                setCreateConfirmOpen(true)
              }}
              className="btn-primary"
            >
              Create Proposal
            </button>
          </div>
        </div>
      )}

      <ConfirmActionModal
        open={createConfirmOpen}
        onClose={() => setCreateConfirmOpen(false)}
        onConfirm={() => {
          if (isDemoMode) alert(`Demo: Proposal "${proposalTitle}" created. Connect wallet to create on-chain.`)
          setProposalTitle('')
          setProposalDesc('')
          setVotingPeriod('')
          setCreateConfirmOpen(false)
        }}
        title="Confirm create proposal"
      >
        <p className="text-gray-400 text-sm mb-1">Title</p>
        <p className="text-white font-semibold">{proposalTitle || '—'}</p>
        <p className="text-gray-400 text-sm mt-2 mb-1">Description</p>
        <p className="text-gray-300 text-sm line-clamp-3">{proposalDesc || '—'}</p>
        <p className="text-gray-400 text-sm mt-2 mb-1">Voting period</p>
        <p className="text-white font-semibold">{votingPeriod || '7'} days</p>
      </ConfirmActionModal>

      <ConfirmActionModal
        open={voteConfirmOpen}
        onClose={() => { setVoteConfirmOpen(false); setVotingProposal(null) }}
        onConfirm={() => {
          if (isDemoMode && votingProposal) alert(`Demo: Voted ${voteFor ? 'For' : 'Against'} "${votingProposal.title}". Connect wallet to vote on-chain.`)
          setVoteConfirmOpen(false)
          setVotingProposal(null)
        }}
        title={votingProposal ? `Confirm vote ${voteFor ? 'For' : 'Against'}` : 'Confirm vote'}
      >
        {votingProposal && (
          <>
            <p className="text-gray-400 text-sm mb-1">Proposal</p>
            <p className="text-white font-semibold">{votingProposal.title}</p>
            <p className="text-gray-400 text-sm mt-2 mb-1">Your vote</p>
            <p className={`font-semibold ${voteFor ? 'text-energy-green' : 'text-red-400'}`}>{voteFor ? 'For' : 'Against'}</p>
          </>
        )}
      </ConfirmActionModal>

      <div className="card">
        <h3 className="text-xl font-semibold text-white mb-4">Active Proposals</h3>
        <div className="space-y-4">
          {mockProposals.map((proposal) => {
            const totalVotes = getTotalVotes(proposal)
            const forPercentage = getVotePercentage(proposal.forVotes, totalVotes)
            const againstPercentage = getVotePercentage(proposal.againstVotes, totalVotes)

            return (
              <div
                key={proposal.id}
                className="p-6 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-white font-semibold text-lg">{proposal.title}</h4>
                      {getStatusBadge(proposal.status)}
                    </div>
                    <p className="text-gray-300 mb-2">{proposal.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>Proposed by: {proposal.proposer}</span>
                      <span>•</span>
                      <span>Ends: {proposal.endTime}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400">Voting Progress</span>
                      <span className="text-white font-semibold">{totalVotes.toLocaleString()} votes</span>
                    </div>
                    <div className="flex h-4 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="bg-energy-green"
                        style={{ width: `${forPercentage}%` }}
                      />
                      <div
                        className="bg-red-500"
                        style={{ width: `${againstPercentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs mt-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-energy-green" />
                        <span className="text-energy-green">{forPercentage}% For</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span className="text-red-400">{againstPercentage}% Against</span>
                      </div>
                    </div>
                  </div>

                  {proposal.status === 'active' && (isConnected || isDemoMode) && (
                    <div className="flex gap-3 pt-3 border-t border-gray-700">
                      <button
                        type="button"
                        onClick={() => { setVotingProposal(proposal); setVoteFor(true); setVoteConfirmOpen(true) }}
                        className="flex-1 btn-primary flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Vote For
                      </button>
                      <button
                        type="button"
                        onClick={() => { setVotingProposal(proposal); setVoteFor(false); setVoteConfirmOpen(true) }}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Vote Against
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="metric-card">
          <div className="flex items-center gap-3 mb-2">
            <Vote className="w-5 h-5 text-energy-green" />
            <h3 className="text-gray-400 text-sm">Voting Power</h3>
          </div>
          <p className="text-2xl font-bold text-white">12,500</p>
          <p className="text-gray-400 text-xs mt-1">GRID Tokens</p>
        </div>
        <div className="metric-card">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-energy-blue" />
            <h3 className="text-gray-400 text-sm">Total Proposals</h3>
          </div>
          <p className="text-2xl font-bold text-white">47</p>
          <p className="text-gray-400 text-xs mt-1">All Time</p>
        </div>
        <div className="metric-card">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-energy-yellow" />
            <h3 className="text-gray-400 text-sm">Active Proposals</h3>
          </div>
          <p className="text-2xl font-bold text-white">2</p>
          <p className="text-gray-400 text-xs mt-1">Currently Voting</p>
        </div>
      </div>
    </div>
  )
}
