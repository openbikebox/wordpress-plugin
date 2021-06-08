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

/*
 * localizes datetime string to local datetime
 */
function localize_datetime(string $datetime_string): DateTime {
    $dt = DateTime::createFromFormat('Y-m-d\TH:i:s\Z', $datetime_string, new DateTimeZone('UTC'));
    $dt->setTimeZone(new DateTimeZone('Europe/Berlin'));
    return $dt;
}

/*
 * formats datetime string
 */
function format_datetime(?string $datetime_string, string $format = 'd.m.Y, H:i'): string {
    if (!$datetime_string)
        return '';
    return localize_datetime($datetime_string)->format($format);
}

/*
 * formats combined begin till end datetime string
 */
function combine_datetime_str(string $begin_string, string $end_string, string $separator = ' - '): string {
    //$begin = localize_datetime($begin_string);
    $end = localize_datetime($end_string);
    /*if ($begin->format('Y') === $end->format('Y'))
        return $begin->format('d.m.') . $separator . $end->format('d.m.');
    return $begin->format('d.m.y') . $separator . $end->format('d.m.y');
    */
    $end->modify('-12 hours');
    return 'bis ' . $end->format('d.m.'). ', 24:00 Uhr';
}

function obb_format_end(DateTime $end): string {
    $end = (clone $end)->modify('-12 hours');
    return 'bis ' . $end->format('d.m.'). ', 24:00 Uhr';
}