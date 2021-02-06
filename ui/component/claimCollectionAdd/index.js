import { connect } from 'react-redux';
import ClaimCollectionAdd from './view';
import { withRouter } from 'react-router';
import {
  makeSelectClaimForUri,
  doLocalCollectionCreate,
  doCollectionEdit,
  selectBuiltinCollections,
  selectMyPublishedCollections,
  selectMyUnpublishedCollections,
} from 'lbry-redux';

const select = (state, props) => ({
  claim: makeSelectClaimForUri(props.uri)(state),
  builtin: selectBuiltinCollections(state),
  published: selectMyPublishedCollections(state),
  unpublished: selectMyUnpublishedCollections(state),
});

const perform = (dispatch) => ({
  addCollection: (name) => dispatch(doLocalCollectionCreate(name)),
  editCollection: (id, params) => dispatch(doCollectionEdit(id, params)),
});

export default withRouter(connect(select, perform)(ClaimCollectionAdd));
