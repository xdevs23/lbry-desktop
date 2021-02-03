// @flow
import * as REACTION_TYPES from 'constants/reactions';
import * as ICONS from 'constants/icons';
import { Lbry } from 'lbry-redux';
import { SORT_COMMENTS_NEW, SORT_COMMENTS_BEST, SORT_COMMENTS_CONTROVERSIAL } from 'constants/comment';
import React, { useEffect } from 'react';
import classnames from 'classnames';
import CommentView from 'component/comment';
import Spinner from 'component/spinner';
import Button from 'component/button';
import Card from 'component/common/card';
import CommentCreate from 'component/commentCreate';
import usePersistedState from 'effects/use-persisted-state';
import { ENABLE_COMMENT_REACTIONS } from 'config';
import { sortComments } from 'util/comments';
import Empty from 'component/common/empty';
import { v4 as uuid } from 'uuid';

type Props = {
  comments: Array<Comment>,
  fetchComments: string => void,
  fetchReacts: string => Promise<any>,
  uri: string,
  claimIsMine: boolean,
  myChannels: ?Array<ChannelClaim>,
  isFetchingComments: boolean,
  linkedComment: any,
  totalComments: number,
  fetchingChannels: boolean,
  reactionsById: ?{ [string]: { [REACTION_TYPES.LIKE | REACTION_TYPES.DISLIKE]: number } },
  activeChannel: string,
};

function CommentList(props: Props) {
  const {
    fetchComments,
    fetchReacts,
    uri,
    comments,
    claimIsMine,
    myChannels,
    isFetchingComments,
    linkedComment,
    totalComments,
    fetchingChannels,
    reactionsById,
    activeChannel,
    channelClaimForUri,
  } = props;

  const [sigData, setSigData] = React.useState();
  const commentRef = React.useRef();
  const spinnerRef = React.useRef();
  const [sort, setSort] = usePersistedState(
    'comment-sort',
    ENABLE_COMMENT_REACTIONS ? SORT_COMMENTS_BEST : SORT_COMMENTS_NEW
  );

  const [start] = React.useState(0);
  const [end, setEnd] = React.useState(9);
  // Display comments immediately if not fetching reactions
  // If not, wait to show comments until reactions are fetched
  const [readyToDisplayComments, setReadyToDisplayComments] = React.useState(
    Boolean(reactionsById) || !ENABLE_COMMENT_REACTIONS
  );

  const myChannelForUri =
    claimIsMine && myChannels && myChannels.length
      ? myChannels.find(channel => channel.name === activeChannel)
      : undefined;
  const channelIdForUri = myChannelForUri && myChannelForUri.claim_id;
  const channelNameForUri = myChannelForUri && myChannelForUri.name;

  const linkedCommentId = linkedComment && linkedComment.comment_id;
  const hasNoComments = !totalComments;
  const moreBelow = totalComments - end > 0;
  const isMyComment = (channelId: string): boolean => {
    if (myChannels != null && channelId != null) {
      for (let i = 0; i < myChannels.length; i++) {
        if (myChannels[i].claim_id === channelId) {
          return true;
        }
      }
    }
    return false;
  };

  const handleMoreBelow = React.useCallback(() => {
    if (moreBelow) {
      setEnd(end + 10);
    }
  }, [end, setEnd, moreBelow]);

  useEffect(() => {
    fetchComments(uri);
  }, [fetchComments, uri]);

  useEffect(() => {
    if (totalComments && ENABLE_COMMENT_REACTIONS && !fetchingChannels) {
      fetchReacts(uri)
        .then(() => {
          setReadyToDisplayComments(true);
        })
        .catch(() => setReadyToDisplayComments(true));
    }
  }, [fetchReacts, uri, totalComments, activeChannel, fetchingChannels]);

  useEffect(() => {
    if (readyToDisplayComments && linkedCommentId && commentRef && commentRef.current) {
      commentRef.current.scrollIntoView({ block: 'start' });
      window.scrollBy(0, -100);
    }
  }, [readyToDisplayComments, linkedCommentId]);

  useEffect(() => {
    function handleCommentScroll(e) {
      // $FlowFixMe
      const rect = spinnerRef.current.getBoundingClientRect();

      const isInViewport =
        rect.top >= 0 &&
        rect.left >= 0 &&
        // $FlowFixMe
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        // $FlowFixMe
        rect.right <= (window.innerWidth || document.documentElement.clientWidth);

      if (isInViewport) {
        handleMoreBelow();
      }
    }

    if (!isFetchingComments && readyToDisplayComments && moreBelow && spinnerRef && spinnerRef.current) {
      window.addEventListener('scroll', handleCommentScroll);
    }

    return () => window.removeEventListener('scroll', handleCommentScroll);
  }, [moreBelow, handleMoreBelow, spinnerRef, isFetchingComments, readyToDisplayComments]);

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //

  function toHex(str) {
    var result = '';
    for (var i = 0; i < str.length; i++) {
      result += str.charCodeAt(i).toString(16);
    }
    return result;
  }

  React.useEffect(() => {
    if (claimIsMine && channelIdForUri && channelNameForUri) {
      Lbry.channel_sign({ channel_id: channelIdForUri, hexdata: toHex(channelNameForUri) })
        .then(res => {
          console.log('res', res);
          if (res.signature) {
            setSigData({ ...res });
          }
        })
        .catch(console.error);
    }
  }, [claimIsMine, channelIdForUri, channelNameForUri]);

  function handleNewBlock(author, authorChannelId) {
    const COMMENTRON_API = 'https://comments.lbry.com/api/v2';
    // const COMMENTRON_API = 'http://f57a05b4de48.ngrok.io/api/v2';

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'moderation.Block',
        params: {
          mod_channel_id: channelIdForUri,
          mod_channel_name: channelNameForUri,
          signature: sigData.signature,
          signing_ts: sigData.signing_ts,
          banned_channel_id: authorChannelId,
          banned_channel_name: author,
        },
        id: uuid(),
      }),
    };

    return fetch(COMMENTRON_API, options)
      .then(res => res.json())
      .then(response => {
        console.log('response', response);
      })
      .catch(error => {
        console.error(error);
      });
  }

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //

  function prepareComments(arrayOfComments, linkedComment, isFetchingComments) {
    let orderedComments = [];

    if (linkedComment) {
      if (!linkedComment.parent_id) {
        orderedComments = arrayOfComments.filter(c => c.comment_id !== linkedComment.comment_id);
        orderedComments.unshift(linkedComment);
      } else {
        const parentComment = arrayOfComments.find(c => c.comment_id === linkedComment.parent_id);
        orderedComments = arrayOfComments.filter(c => c.comment_id !== linkedComment.parent_id);

        if (parentComment) {
          orderedComments.unshift(parentComment);
        }
      }
    } else {
      orderedComments = arrayOfComments;
    }
    return orderedComments;
  }

  // Default to newest first for apps that don't have comment reactions
  const sortedComments = reactionsById ? sortComments({ comments, reactionsById, sort, isMyComment }) : [];
  const displayedComments = readyToDisplayComments
    ? prepareComments(sortedComments, linkedComment).slice(start, end)
    : [];

  return (
    <Card
      title={
        totalComments > 0
          ? totalComments === 1
            ? __('1 comment')
            : __('%total_comments% comments', { total_comments: totalComments })
          : __('Leave a comment')
      }
      titleActions={
        <>
          {totalComments > 1 && ENABLE_COMMENT_REACTIONS && (
            <span className="comment__sort">
              <Button
                button="alt"
                label={__('Best')}
                icon={ICONS.BEST}
                iconSize={18}
                onClick={() => setSort(SORT_COMMENTS_BEST)}
                className={classnames(`button-toggle`, {
                  'button-toggle--active': sort === SORT_COMMENTS_BEST,
                })}
              />
              <Button
                button="alt"
                label={__('Controversial')}
                icon={ICONS.CONTROVERSIAL}
                iconSize={18}
                onClick={() => setSort(SORT_COMMENTS_CONTROVERSIAL)}
                className={classnames(`button-toggle`, {
                  'button-toggle--active': sort === SORT_COMMENTS_CONTROVERSIAL,
                })}
              />
              <Button
                button="alt"
                label={__('New')}
                icon={ICONS.NEW}
                iconSize={18}
                onClick={() => setSort(SORT_COMMENTS_NEW)}
                className={classnames(`button-toggle`, {
                  'button-toggle--active': sort === SORT_COMMENTS_NEW,
                })}
              />
            </span>
          )}
          <Button
            button="alt"
            icon={ICONS.REFRESH}
            title={__('Refresh')}
            onClick={() => {
              fetchComments(uri);
              fetchReacts(uri);
            }}
          />
        </>
      }
      actions={
        <>
          <CommentCreate uri={uri} />

          {!isFetchingComments && hasNoComments && (
            <Empty padded text={__('That was pretty deep. What do you think?')} />
          )}

          <ul className="comments" ref={commentRef}>
            {comments &&
              displayedComments &&
              displayedComments.map(comment => {
                return (
                  <CommentView
                    isTopLevel
                    threadDepth={3}
                    key={comment.comment_id}
                    uri={uri}
                    authorUri={comment.channel_url}
                    author={comment.channel_name}
                    authorChannelId={comment.channel_id}
                    claimId={comment.claim_id}
                    commentId={comment.comment_id}
                    message={comment.comment}
                    timePosted={comment.timestamp * 1000}
                    claimIsMine={claimIsMine}
                    commentIsMine={comment.channel_id && isMyComment(comment.channel_id)}
                    linkedComment={linkedComment}
                    isPinned={comment.is_pinned}
                    sigData={sigData}
                    handleNewBlock={handleNewBlock}
                  />
                );
              })}
          </ul>

          {(isFetchingComments || moreBelow) && (
            <div className="main--empty" ref={spinnerRef}>
              <Spinner type="small" />
            </div>
          )}
        </>
      }
    />
  );
}

export default CommentList;
