<?php
/*
openbikebox Frontend
Copyright (C) 2021 binary butterfly GmbH

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

defined('ABSPATH') or die('nope.');


function obb_parse_datetime(string $datetime_string): DateTime {
    return DateTime::createFromFormat('Y-m-d\TH:i:s\Z', $datetime_string, new DateTimeZone('UTC'));
}


/*
 * localizes datetime string to local datetime
 */
function obb_localize_datetime(DateTime $datetime): DateTime {
    $localized_datetime = clone $datetime;
    $localized_datetime->setTimeZone(new DateTimeZone('Europe/Berlin'));
    return $localized_datetime;
}

/*
 * formats datetime string
 */
function obb_format_datetime(DateTime $datetime, bool $transform_midnight = false, bool $include_year = false): string {
    $localized_datetime = obb_localize_datetime($datetime);
    if ($transform_midnight && $localized_datetime->format('H:i') === '00:00')
        return $datetime->format(($include_year) ? 'd.m.Y' : 'd.m.'). ', 24:00 Uhr';
    return $localized_datetime->format(($include_year) ? 'd.m.Y, H:i' : 'd.m., H:i');
}


function obb_format_combine_datetime(DateTime $begin, DateTime $end, $separator = ' - '): string {
    if (substr(obb_format_datetime($begin, false, true), 0, 10) === substr(obb_format_datetime($end, true, true), 0, 10))
        return substr(obb_format_datetime($begin), 0, 6) . ', ' . substr(obb_format_datetime($begin), 8, 5) . $separator . substr(obb_format_datetime($end, true), 8, 5);
    if ($begin->format('Y') === $end->format('Y'))
        return obb_format_datetime($begin) . $separator . obb_format_datetime($end, true);
    return obb_format_datetime($begin, false, true) . $separator . obb_format_datetime($end, true, true);
}

/*
 * formats combined begin till end datetime string
 */
function obb_format_combine_datetime_str(string $begin_string, string $end_string, bool $future_booking = false): string {
    $begin = obb_parse_datetime($begin_string);
    $end = obb_parse_datetime($end_string);
    if ($future_booking)
        return obb_format_combine_datetime($begin, $end);
    return obb_format_end($end);
}

function obb_format_end(DateTime $end): string {
    return 'bis ' . obb_format_datetime($end, false, $end->format('Y') !== (new DateTime())->format('Y'));
}
