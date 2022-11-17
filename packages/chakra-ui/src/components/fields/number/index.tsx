import React, { ReactChild } from "react";

import { RefineFieldNumberProps } from "@pankod/refine-ui-types";
import { Text, TextProps } from "@chakra-ui/react";

function toLocaleStringSupportsOptions() {
    return !!(
        typeof Intl == "object" &&
        Intl &&
        typeof Intl.NumberFormat == "function"
    );
}
export type NumberFieldProps = RefineFieldNumberProps<ReactChild, TextProps>;
/**
 * This field is used to display a number formatted according to the browser locale, right aligned. and uses {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl `Intl`} to display date format
 * and Chakra UI {@link https://chakra-ui.com/docs/components/text  `<Text>`} component.
 * @see {@link https://refine.dev/docs/ui-frameworks/chakra-ui/components/fields/number} for more details.
 */
export const NumberField: React.FC<NumberFieldProps> = ({
    value,
    locale,
    options,
    ...rest
}) => {
    const number = parseFloat(value.toString());

    return (
        <Text {...rest}>
            {toLocaleStringSupportsOptions()
                ? number.toLocaleString(locale, options)
                : number}
        </Text>
    );
};