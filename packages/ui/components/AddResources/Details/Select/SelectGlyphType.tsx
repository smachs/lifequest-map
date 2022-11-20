import { useState } from 'react';
import generalStyles from '../../AddResources.module.css';
import styles from './SelectGlyphType.module.css';

import type { Glyph } from 'static';
import type { Details } from '../../AddResources';

import { glyphs } from 'static';
import CloseIcon from '../../../icons/CloseIcon';
import SearchInput from '../../../SearchInput/SearchInput';
import { escapeRegExp } from '../../../../utils/regExp';

type SelectGlyphTypeIsRequired = {
  details: Details;
  isRequired: boolean;
  onChange: (details: Details) => void;
};

function SelectGlyphType({
  details,
  onChange,
  isRequired,
}: SelectGlyphTypeIsRequired): JSX.Element {
  const [glyph, setGlyph] = useState<Glyph | null>(() => null);
  const [search, setSearch] = useState('');
  const [isFocus, setIsFocus] = useState(false);

  const regExp = new RegExp(escapeRegExp(search), 'ig');
  const filteredGlyphs = glyphs.filter(
    (glyph: Glyph) =>
      glyph.name.match(regExp) || glyph.id.toString().match(regExp)
  );

  const handleChange = (glyph: Glyph | null) => {
    onChange({
      ...details,
      requiredGlyphId: glyph?.id,
    });
    setGlyph(glyph);
  };

  const GlyphLabel = 'Glyph ' + (isRequired ? '(required)' : '(optional)');

  if (glyph) {
    return (
      <label className={styles.label}>
        <span className={generalStyles.key}>{GlyphLabel}</span>
        <div className={styles.filter} onClick={() => handleChange(null)}>
          <img src={glyph?.iconUrl} alt="" />
          {glyph?.name + ' (' + glyph.id + ')'} <CloseIcon />
        </div>
      </label>
    );
  }

  const handleClick = (glyph: Glyph | null) => () => {
    setSearch('');
    handleChange(glyph);
  };

  const renderButton = (glyph: Glyph | null) => (
    <button
      key={'glyph-' + glyph?.id}
      onMouseDown={handleClick(glyph)}
      className={styles.filter}
    >
      {glyph?.iconUrl ? <img src={glyph?.iconUrl} alt="" /> : ''}
      {(glyph?.name || 'None') + (glyph?.id ? ' (' + glyph?.id + ')' : '')}
    </button>
  );

  return (
    <div className={styles.container}>
      <label className={styles.label}>
        <span className={generalStyles.key}>{GlyphLabel}</span>
        <SearchInput
          placeholder="Search glyph..."
          value={search}
          onChange={setSearch}
          autoFocus
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
        />
      </label>
      {isFocus && (
        <div className={styles.suggestions}>
          {(isRequired ? [] : [renderButton(null)]).concat(
            filteredGlyphs.map(renderButton)
          )}
          {filteredGlyphs.length === 0 && 'No results'}
        </div>
      )}
    </div>
  );
}

export default SelectGlyphType;
