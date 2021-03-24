// @flow
import { SEARCH_OPTIONS } from 'constants/search';
import * as ICONS from 'constants/icons';
import React, { useMemo } from 'react';
import { Form, FormField } from 'component/common/form';
import Button from 'component/button';
import Icon from 'component/common/icon';
import classnames from 'classnames';
// import moment from "moment";

const CLAIM_TYPES = {
  [SEARCH_OPTIONS.INCLUDE_FILES]: 'Files',
  [SEARCH_OPTIONS.INCLUDE_CHANNELS]: 'Channels',
  [SEARCH_OPTIONS.INCLUDE_FILES_AND_CHANNELS]: 'Everything',
};

const TYPES_ADVANCED = {
  [SEARCH_OPTIONS.MEDIA_VIDEO]: 'Video',
  [SEARCH_OPTIONS.MEDIA_AUDIO]: 'Audio',
  [SEARCH_OPTIONS.MEDIA_IMAGE]: 'Image',
  [SEARCH_OPTIONS.MEDIA_TEXT]: 'Text',
  [SEARCH_OPTIONS.MEDIA_APPLICATION]: 'Other',
};

const UPLOAD_DATE = {
  '': '---',
  HOURS: 'Last Hour',
  DAYS: 'Last 24 Hours',
  WEEKS: 'This Week',
  MONTHS: 'This Month',
  YEARS: 'This Year',
};

const SORT_BY = {
  '': 'Relevance',
  [SEARCH_OPTIONS.SORT_DESCENDING]: 'Newest first',
  [SEARCH_OPTIONS.SORT_ACCENDING]: 'Oldest first',
};

type Props = {
  setSearchOption: (string, boolean | string | number) => void,
  options: {},
  simple: boolean,
  expanded: boolean,
  toggleSearchExpanded: () => void,
};

const SearchOptions = (props: Props) => {
  const { options, simple, setSearchOption, expanded, toggleSearchExpanded } = props;

  const stringifiedOptions = JSON.stringify(options);
  const resultCount = options[SEARCH_OPTIONS.RESULT_COUNT];

  const isFilteringByChannel = useMemo(() => {
    const jsonOptions = JSON.parse(stringifiedOptions);
    const claimType = String(jsonOptions[SEARCH_OPTIONS.CLAIM_TYPE] || '');
    return claimType.includes(SEARCH_OPTIONS.INCLUDE_CHANNELS);
  }, [stringifiedOptions]);

  const [uploadDateFilter, setUploadDateFilter] = React.useState('');

  if (simple) {
    delete TYPES_ADVANCED[SEARCH_OPTIONS.MEDIA_APPLICATION];
  }

  function addRow(label: string, value: any) {
    return (
      <tr>
        <td>
          <legend className="search__legend">{label}</legend>
        </td>
        <td>{value}</td>
      </tr>
    );
  }

  const OBJ_TO_OPTION_ELEM = (obj) => {
    return Object.entries(obj).map((x) => {
      return (
        <option key={x[0]} value={x[0]}>
          {__(String(x[1]))}
        </option>
      );
    });
  };

  const typeElem = (
    <>
      <div className="claim-type-filter">
        {Object.entries(CLAIM_TYPES).map((t) => {
          const option = t[0];
          if (option === SEARCH_OPTIONS.INCLUDE_FILES_AND_CHANNELS) {
            return null;
          }
          return (
            <Button
              key={option}
              button="alt"
              label={t[1]}
              className={classnames(`button-toggle`, {
                'button-toggle--active': options[SEARCH_OPTIONS.CLAIM_TYPE] === option,
              })}
              onClick={() => setSearchOption(SEARCH_OPTIONS.CLAIM_TYPE, option)}
            />
          );
        })}
      </div>
      <Button
        button="close"
        className={classnames('close-button', {
          'close-button--visible': options[SEARCH_OPTIONS.CLAIM_TYPE] !== SEARCH_OPTIONS.INCLUDE_FILES_AND_CHANNELS,
        })}
        icon={ICONS.REMOVE}
        onClick={() => setSearchOption(SEARCH_OPTIONS.CLAIM_TYPE, SEARCH_OPTIONS.INCLUDE_FILES_AND_CHANNELS)}
      />
      <div className="media-types">
        {options[SEARCH_OPTIONS.CLAIM_TYPE] === SEARCH_OPTIONS.INCLUDE_FILES &&
          Object.entries(TYPES_ADVANCED).map((t) => {
            const option = t[0];
            return (
              <FormField
                key={option}
                name={option}
                type="checkbox"
                blockWrap={false}
                disabled={options[SEARCH_OPTIONS.CLAIM_TYPE] !== SEARCH_OPTIONS.INCLUDE_FILES}
                label={t[1]}
                checked={!isFilteringByChannel && options[option]}
                onChange={() => setSearchOption(option, !options[option])}
              />
            );
          })}
      </div>
    </>
  );

  const otherOptionsElem = (
    <>
      <div className="exact-match">
        <FormField
          type="checkbox"
          name="exact-match"
          checked={options[SEARCH_OPTIONS.EXACT]}
          onChange={() => setSearchOption(SEARCH_OPTIONS.EXACT, !options[SEARCH_OPTIONS.EXACT])}
          label={__('Exact match')}
        />
        <Icon
          className="icon--help"
          icon={ICONS.HELP}
          tooltip
          size={16}
          customTooltipText={__(
            'Find results that include all the given words in the exact order.\nThis can also be done by surrounding the search query with quotation marks (e.g. "hello world").'
          )}
        />
      </div>
      {!simple && (
        <FormField
          type="select"
          name="result-count"
          value={resultCount}
          onChange={(e) => setSearchOption(SEARCH_OPTIONS.RESULT_COUNT, e.target.value)}
          blockWrap={false}
          label={__('Returned Results')}
        >
          <option value={10}>10</option>
          <option value={30}>30</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </FormField>
      )}
    </>
  );

  const uploadDateElem = (
    <>
      <FormField
        type="select"
        name="upload-date"
        value={uploadDateFilter}
        onChange={(e) => {
          const selectionId = e.target.value;
          // const from = moment(Date.now()).subtract(1, selectionId.toLowerCase());
          setUploadDateFilter(selectionId);
        }}
        blockWrap={false}
      >
        {OBJ_TO_OPTION_ELEM(UPLOAD_DATE)}
      </FormField>
      <em>wip: pending Lighthouse addition</em>
    </>
  );

  const sortByElem = (
    <FormField
      type="select"
      name="sort-by"
      blockWrap={false}
      value={options[SEARCH_OPTIONS.SORT]}
      onChange={(e) => setSearchOption(SEARCH_OPTIONS.SORT, e.target.value)}
    >
      {OBJ_TO_OPTION_ELEM(SORT_BY)}
    </FormField>
  );

  return (
    <div>
      <Button
        button="alt"
        label={__('Filter')}
        icon={ICONS.FILTER}
        iconRight={expanded ? ICONS.UP : ICONS.DOWN}
        onClick={toggleSearchExpanded}
      />
      <Form
        className={classnames('search__options', {
          'search__options--expanded': expanded,
        })}
      >
        <table className="table table--condensed">
          <tbody>
            {addRow(__('Type'), typeElem)}
            {false && addRow(__('Upload Date'), uploadDateElem)}
            {addRow(__('Sort By'), sortByElem)}
            {addRow(__('Other Options'), otherOptionsElem)}
          </tbody>
        </table>
      </Form>
    </div>
  );
};

export default SearchOptions;
