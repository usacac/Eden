import { GiCheckeredFlag } from "react-icons/gi";
import { FaStar } from "react-icons/fa";

import { Text } from "_app/ui";
import { VoteData } from "elections/interfaces";

interface Props {
    voteData: VoteData[];
}

const tallyVotes = (participantVoteData: VoteData[]) => {
    const votes = participantVoteData.filter((pv) => pv.candidate);
    const threshold = Math.floor(votes.length * (2 / 3) + 1);

    const voteRecipients = new Set(
        participantVoteData.map((v) => v.candidate).filter((c) => c)
    );

    const candidatesByVotesReceived: { [key: number]: string[] } = {};
    Array.from(voteRecipients).forEach((candidate) => {
        const numVotesReceived = participantVoteData.filter(
            (vote) => vote.candidate === candidate
        ).length;
        if (candidatesByVotesReceived[numVotesReceived]) {
            candidatesByVotesReceived[numVotesReceived].push(candidate);
        } else {
            candidatesByVotesReceived[numVotesReceived] = [candidate];
        }
    });

    const leadTally = Object.keys(candidatesByVotesReceived).length
        ? Math.max(...Object.keys(candidatesByVotesReceived).map(Number))
        : 0;

    const candidatesWithMostVotes = candidatesByVotesReceived[leadTally] ?? [];
    const thereIsOneLeader = candidatesWithMostVotes.length === 1;

    const leaderIsVotingForSelf =
        thereIsOneLeader &&
        participantVoteData.some(
            (participant) =>
                participant.member === candidatesWithMostVotes[0] &&
                participant.candidate === candidatesWithMostVotes[0]
        );

    const didReachConsensus = leadTally >= threshold && leaderIsVotingForSelf;

    return {
        totalVotesCast: votes.length,
        leadCandidates: candidatesWithMostVotes,
        leadTally,
        totalVotesRequiredForConsensus: threshold,
        remainingVotesRequiredForConsensus: threshold - leadTally,
        leaderIsVotingForSelf,
        isThereConsensus: didReachConsensus,
    };
};

export const Consensometer = ({ voteData }: Props) => {
    // we could use fixtures, but inlining this means we see results without reloads
    const testVotes = [
        {
            member: "edenmember11",
            round: 1,
            index: 0,
            candidate: "edenmember13",
        },
        {
            member: "egeon.edev",
            round: 1,
            index: 0,
            candidate: "edenmember13",
        },
        {
            member: "edenmember13",
            round: 1,
            index: 0,
            candidate: "edenmember13",
        },
        {
            member: "edenmember14",
            round: 1,
            index: 0,
            candidate: "edenmember13",
        },
        {
            member: "edenmember15",
            round: 1,
            index: 0,
            candidate: "edenmember14",
        },
    ];

    const {
        isThereConsensus,
        leadCandidates,
        leaderIsVotingForSelf,
        leadTally,
        totalVotesCast,
        totalVotesRequiredForConsensus,
        remainingVotesRequiredForConsensus,
    } = tallyVotes(voteData);

    let helpText = "Waiting for votes";
    if (isThereConsensus) {
        helpText = "Consensus reached";
    } else if (
        leadTally >= totalVotesRequiredForConsensus &&
        !leaderIsVotingForSelf
    ) {
        helpText = "Leader must vote for themself!";
    } else if (leadCandidates.length === 1) {
        helpText = `Leader needs ${
            remainingVotesRequiredForConsensus > 1
                ? `${remainingVotesRequiredForConsensus} more votes`
                : "another vote"
        }`;
    }

    return (
        <div className="flex flex-col items-end space-y-1 pt-1">
            <div className="flex space-x-1">
                {Array.from({ length: totalVotesCast }).map((_, i) => {
                    let thisBlock = i + 1;
                    let color = "bg-gray-300";

                    // Blocks represent votes cast
                    // Number of blue blocks represents votes cast for leading candidate(s)
                    // Green blocks are votes cast for the leading candidate once consensus is reached
                    // Finish line/flag block represents number of votes required to reach consensus
                    // Finish line/flag block is skipped if number of votes to reach consensus is attained but lead candidate is not voting for themself

                    if (leaderIsVotingForSelf) {
                        if (thisBlock <= leadTally && isThereConsensus) {
                            color = "bg-green-500";
                        } else if (thisBlock <= leadTally) {
                            color = "bg-blue-500";
                        }
                    } else if (thisBlock !== totalVotesRequiredForConsensus) {
                        // apply blue blocks like before but skip/ignore the finish line block
                        if (thisBlock > totalVotesRequiredForConsensus) {
                            thisBlock = i;
                        }
                        if (thisBlock <= leadTally) {
                            color = "bg-blue-500";
                        }
                    }

                    return (
                        <div
                            key={"consensometer - " + i}
                            className={`flex justify-center items-center w-9 h-5 rounded ${color}`}
                        >
                            {i + 1 === totalVotesRequiredForConsensus &&
                                (isThereConsensus ? (
                                    <FaStar
                                        size={14}
                                        className="text-yellow-500"
                                    />
                                ) : (
                                    <GiCheckeredFlag size={16} color="black" />
                                ))}
                        </div>
                    );
                })}
            </div>
            <Text size="sm" type="note">
                {helpText}
            </Text>
        </div>
    );
};

export default Consensometer;
