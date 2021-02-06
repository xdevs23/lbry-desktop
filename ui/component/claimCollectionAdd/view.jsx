// @flow
import React from 'react';
import Button from 'component/button';
import Card from 'component/common/card';
import { FormField } from 'component/common/form';
import * as ICONS from 'constants/icons';
import Icon from 'component/common/icon';
import classnames from 'classnames';

import { isNameValid } from 'lbry-redux';
import { INVALID_NAME_ERROR } from 'constants/claim';

type Props = {
  claim: Claim,
  builtin: any,
  published: any,
  unpublished: any,
  addCollection: (string) => void, // maybe promise
  editCollection: (string, CollectionUpdateParams) => void,
  closeModal: () => void,
  uri: string,
};
/*
  collectionAdd component
  // Add a new collection
  // Click a + or - to add or remove to a collection
  has_uri:
    ADD COLLECTION (implied private)
    IS_PUBLISHED: (selector)
        EDIT COLLECTION //doEditCollection() -> +/- edits: {}
    IS NOT PUBLISHED
        EDIT COLLECTION //doEditCollection() -> +/- in place
    IS BUILT IN
        EDIT COLLECTION //doEditCollection() -> +/- in place
 */
const ClaimCollectionAdd = (props: Props) => {
  const { builtin, published, unpublished, addCollection, editCollection, claim, closeModal, uri } = props;
  const permanentUrl = claim && claim.permanent_url;

  const [newCollectionName, setNewCollectionName] = React.useState('');
  const [newCollectionPlaylist, setNewCollectionPlaylist] = React.useState(false);
  const [newCollectionNameError, setNewCollectionNameError] = React.useState();

  const isPlayable =
    claim &&
    claim.value &&
    // $FlowFixMe
    claim.value.stream_type &&
    (claim.value.stream_type === 'audio' || claim.value.stream_type === 'video');

  React.useEffect(() => {
    if (isPlayable) {
      setNewCollectionPlaylist(true);
    }
  }, [isPlayable, setNewCollectionPlaylist]);
  function handleNameInput(e) {
    const { value } = e.target;
    setNewCollectionName(value);
    if (!isNameValid(value, 'false')) {
      setNewCollectionNameError(INVALID_NAME_ERROR);
    } else {
      setNewCollectionNameError();
    }
  }

  function handleAddCollection() {
    addCollection(newCollectionName);
    setNewCollectionName('');
    // maybe.then
  }

  function handleEditCollection(collectionId, remove) {
    if (claim && collectionId) {
      editCollection(collectionId, { claims: [claim], remove });
    }
  }

  return (
    <Card
      title={__('Add to collection')}
      subtitle={__('Add uri to collection')}
      actions={
        <div className="card__body">
          {uri && (
            <>
              {/* $FlowFixMe */}
              {Object.values(builtin).map((l) => {
                const { items, id, name } = l;
                const isAdded = items.some((i) => i === permanentUrl);
                return (
                  <div
                    key={id}
                    className={classnames(
                      'section section--padded-small',
                      'card--inline',
                      'form-field__internal-option',
                      {
                        'card--highlighted': isAdded,
                        'form-field__internal-option': true,
                      }
                    )}
                  >
                    <h3>
                      <Icon icon={ICONS.HOME} />
                      {name}
                    </h3>
                    <Button
                      button={'close'}
                      title={__('Remove custom wallet server')}
                      icon={isAdded ? ICONS.REMOVE : ICONS.ADD}
                      onClick={() => handleEditCollection(id, isAdded)}
                    />
                  </div>
                );
              })}
              {unpublished &&
                // $FlowFixMe
                Object.values(unpublished).map((l) => {
                  const { items, id, name } = l;
                  const isAdded = items && items.some((i) => i === permanentUrl);
                  return (
                    <div
                      key={id}
                      className={classnames('section section--padded-small', 'card-collection-selector', {
                        'card--highlighted': isAdded,
                        'form-field__internal-option': true,
                      })}
                    >
                      <h3>
                        <Icon icon={ICONS.LIBRARY} />
                        {name}
                      </h3>
                      <Button
                        button={'close'}
                        title={__('Add')}
                        icon={isAdded ? ICONS.REMOVE : ICONS.ADD}
                        onClick={() => handleEditCollection(id, isAdded)}
                      />
                    </div>
                  );
                })}
              {published &&
                // $FlowFixMe
                Object.values(published).map((l) => {
                  const { items, id, name } = l;
                  const isAdded = items && items.some((i) => i === permanentUrl);
                  return (
                    <div
                      key={id}
                      className={classnames('section section--padded-small', 'card-collection-selector', {
                        'card--highlighted': isAdded,
                        'form-field__internal-option': true,
                      })}
                    >
                      <h3>
                        <Icon icon={ICONS.PUBLISH} />
                        {name}
                      </h3>
                      <Button
                        button={'close'}
                        title={__('Add')}
                        icon={isAdded ? ICONS.REMOVE : ICONS.ADD}
                        onClick={() => handleEditCollection(id, isAdded)}
                      />
                    </div>
                  );
                })}
            </>
          )}

          <FormField
            type="text"
            name="new_collection"
            value={newCollectionName}
            error={newCollectionNameError}
            inputButton={
              <Button
                button={'secondary'}
                icon={ICONS.ADD}
                disabled={!newCollectionName.length}
                onClick={() => handleAddCollection()}
              />
            }
            onChange={handleNameInput}
            placeholder={__('New Collection')}
          />
          <FormField
            checked={newCollectionPlaylist}
            type="checkbox"
            onClick={() => setNewCollectionPlaylist(!newCollectionPlaylist)}
            name="replace-claims"
            label={__('Playable List')}
          />
          <div className="card__actions">
            <Button button="secondary" label={__('Done')} onClick={closeModal} />
          </div>
        </div>
      }
    />
  );
};
export default ClaimCollectionAdd;
