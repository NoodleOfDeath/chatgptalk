import React from 'react';

import { FONT_SIZES, Stylable } from '~/components';
import { SessionContext } from '~/contexts';
import { useTheme } from '~/hooks';

export type UseStylesOptions = {
  onlyInclude?: string[];
};

export function useStyles({
  // position
  absolute,
  relative,
  top,
  bottom,
  left,
  right,
  // dimensions
  aspectRatio,
  width,
  height,
  // typographies
  caption,
  subtitle1,
  subtitle2,
  body1,
  body2,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  // text styles
  color,
  textCenter,
  textLeft,
  textRight,
  fontFamily,
  fontSize = caption ? FONT_SIZES.caption : subtitle1 ? FONT_SIZES.subtitle1 : subtitle2 ? FONT_SIZES.subtitle2 : body1 ? FONT_SIZES.body1 : body2 ? FONT_SIZES.body2 : h1 ? FONT_SIZES.h1 : h2 ? FONT_SIZES.h2 : h3 ? FONT_SIZES.h3 : h4 ? FONT_SIZES.h4 : h5 ? FONT_SIZES.h5 : h6 ? FONT_SIZES.h6 : FONT_SIZES.body1,
  bold,
  italic,
  underline,
  // flex styles
  flex,
  flexWrap,
  flexGrow,
  flexRow,
  flexRowReverse,
  flexColumn,
  flexColumnReverse,
  gap,
  rowGap = gap,
  colGap = gap,
  col,
  row,
  alignCenter,
  alignEnd,
  alignStart,
  justifyCenter,
  justifyEnd,
  justifyStart,
  justifySpaced,
  // margin
  m,
  mh = m,
  mv = m,
  mt = mv,
  mb = mv,
  ml = mh,
  mr = mh,
  // padding
  p,
  ph = p,
  pv = p,
  pt = pv,
  pb = pv,
  pl = ph,
  pr = ph,
  // appearance
  borderColor,
  border = borderColor ? 1 : undefined,
  bg,
  opacity,
  outlined,
  contained,
  rounded,
  overflow,
  // selectable,
  // other
  style,
} : Stylable, { onlyInclude }: UseStylesOptions = {}) {
  const theme = useTheme();
  
  const { preferences: { fontFamily: preferredFont, textScale } } = React.useContext(SessionContext);
  const newStyle = React.useMemo(() => ({ ...style }), [style]);

  const position = React.useMemo(() => {
    if (absolute) {
      return { position: 'absolute' };
    }
    if (relative) {
      return { position: 'relative' };
    }
  }, [absolute, relative]);
  
  const textAlign = React.useMemo(() => {
    if (textLeft) {
      return { textAlign: 'left' };
    }
    if (textCenter) {
      return { textAlign: 'center' };
    } 
    if (textRight) {
      return { textAlign: 'right' };
    }
  }, [textLeft, textCenter, textRight]);
  
  const alignItems = React.useMemo(() => {
    if (alignCenter) {
      return { alignItems: 'center' };
    }
    if (alignStart) {
      return { alignItems: 'flex-start' };
    }
    if (alignEnd) {
      return { alignItems: 'flex-end' };
    }
  }, [alignCenter, alignEnd, alignStart]);

  const justifyContent = React.useMemo(() => {
    if (justifyCenter) {
      return { justifyContent: 'center' };
    }
    if (justifyStart) {
      return { justifyContent: 'flex-start' };
    }
    if (justifyEnd) {
      return { justifyContent: 'flex-end' };
    }
    if (justifySpaced) {
      return { justifyContent: 'space-between' };
    }
  }, [justifyCenter, justifyEnd, justifySpaced, justifyStart]);
  
  const appearance = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const appearance: any[] = [];
    if (outlined === true) {
      appearance.push(theme.components.outlined);
    } else
    if (typeof outlined === 'string') {
      appearance.push({ borderColor: outlined, borderWidth: 1 });
    } else
    if (typeof outlined === 'number') {
      appearance.push({ borderColor: theme.colors.primary, borderWidth: outlined });
    } else
    if (Array.isArray(outlined) && outlined.length === 2 && typeof outlined[0] === 'string' && typeof outlined[1] === 'number') {
      appearance.push({
        borderColor: outlined[0],
        borderWidth: outlined[1],
      });
    } else
    if (contained) {
      appearance.push(theme.components.buttonSelected);
    }
    if (opacity) {
      appearance.push({ opacity });
    }
    if (overflow) {
      appearance.push({ overflow });
    }
    return appearance.reduce((cur, n) => ({ ...cur, ...n }), {});
  }, [opacity, outlined, contained, theme, overflow]);

  const viewStyle = React.useMemo(() => {
    const scale = ((((textScale ?? 1) - 1) / 2) + 1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attrs: any[] = [];
    attrs.push(position ? position : undefined);
    attrs.push(top ? { top: typeof top === 'number' ? top * scale : top } : undefined);
    attrs.push(left ? { left: typeof left === 'number' ? left * scale : left } : undefined);
    attrs.push(right ? { right: typeof right === 'number' ? right * scale : right } : undefined);
    attrs.push(bottom ? { bottom: typeof bottom === 'number' ? bottom * scale : bottom } : undefined);
    attrs.push(row ? theme.components.flexRow : undefined);
    attrs.push(col ? theme.components.flexCol : undefined);
    attrs.push(flex ? { flex } : undefined);
    attrs.push(flexWrap ? { flexWrap } : undefined);
    attrs.push(flexGrow ? { flexGrow } : undefined);
    attrs.push(flexRow ? { flexDirection: 'row' } : undefined);
    attrs.push(flexRowReverse ? { flexDirection: 'row-reverse' } : undefined);
    attrs.push(flexColumn ? { flexDirection: 'column' } : undefined);
    attrs.push(flexColumnReverse ? { flexDirection: 'column-reverse' } : undefined);
    attrs.push(rowGap ? { rowGap: rowGap * scale } : undefined);
    attrs.push(colGap ? { columnGap: colGap * scale } : undefined);
    attrs.push(textAlign);
    attrs.push(bold ? { fontWeight: 'bold' } : undefined);
    attrs.push(italic ? { fontStyle: 'italic' } : undefined);
    attrs.push(underline ? { textDecorationLine: 'underline' } : undefined);
    attrs.push({ fontFamily : fontFamily ?? preferredFont });
    attrs.push(alignItems);
    attrs.push(justifyContent);
    attrs.push(appearance);
    attrs.push(color ? { color: Object.keys(theme.colors).includes(color) ? theme.colors[color as keyof typeof theme.colors] : color } : undefined);
    attrs.push(aspectRatio ? { aspectRatio } : undefined);
    attrs.push(width ? { width } : undefined);
    attrs.push(height ? { height } : undefined);
    attrs.push({ fontSize : fontSize * scale });
    attrs.push(border ? { border } : undefined);
    attrs.push(borderColor ? { borderColor } : undefined);
    attrs.push(bg ? { backgroundColor: bg } : undefined);
    attrs.push(rounded ? theme.components.rounded : undefined);
    attrs.push(mt ? { marginTop: mt * scale } : undefined);
    attrs.push(mb ? { marginBottom: mb * scale } : undefined);
    attrs.push(ml ? { marginLeft: ml * scale } : undefined);
    attrs.push(mr ? { marginRight: mr * scale } : undefined);
    attrs.push(pt ? { paddingTop: pt * scale } : undefined);
    attrs.push(pb ? { paddingBottom: pb * scale } : undefined);
    attrs.push(pl ? { paddingLeft: pl * scale } : undefined);
    attrs.push(pr ? { paddingRight: pr * scale } : undefined);
    return attrs.filter((v) => v !== undefined && ((onlyInclude && Object.keys(v).every((e) => onlyInclude.includes(e))) || !onlyInclude)).reduce((acc, val) => ({ ...acc, ...val }), newStyle ?? {});
  }, [textScale, position, top, left, right, bottom, row, theme, col, flex, flexWrap, flexGrow, flexRow, flexRowReverse, flexColumn, flexColumnReverse, rowGap, colGap, textAlign, bold, italic, underline, fontFamily, preferredFont, alignItems, justifyContent, appearance, color, aspectRatio, width, height, fontSize, border, borderColor, bg, rounded, mt, mb, ml, mr, pt, pb, pl, pr, newStyle, onlyInclude]);
  return viewStyle;
}