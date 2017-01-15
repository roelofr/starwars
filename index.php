<?php

date_default_timezone_set('Europe/Amsterdam');

require_once __DIR__ . '/constants.php';
require_once __DIR__ . '/functions.php';

$templateFile = __DIR__ . '/dev/html/main.html';

if (!file_exists($templateFile)) {
    http_response_code(500);
    echo "<h1>500 Internal Server Error</h1>";
    die();
}

$html = file_get_contents($templateFile);
$htmlMod = filemtime($templateFile);

$showDate = new DateTime(GOAL_DATE);
$nowDate = new DateTime();

$showDiff = $showDate->diff($nowDate);
$isPast = !($showDiff->invert);

if ($isPast) {
    $lastModified = max($showDate->getOffset(), $htmlMod);
} else {
    $lastModified = $htmlMod;
}
$lastModifiedS = gmdate('r', $lastModified);

// Check if we've got a check header
$headerMod = filter_input(INPUT_SERVER, 'HTTP_IF_MODIFIED_SINCE');
if ($headerMod) {
    $mod = strtotime($headerMod);
    if ($mod == $lastModified) {
        http_response_code(304);
        exit();
    }
}

$lang = (object) array(
    'yes' => 'Yep! We gaan!',
    'yes_eta' => 'May the force be with you!',
    'no' => 'Nee, nog even wachten',
    'no_eta' => 'Tijd voordat we gaan: %s',
    'no_cont' => '<span data-content="countdown">%s</span>'
);

/**
 * Calculates the sha384 hash of a file
 * @param $file The file to check
 * @return string hash, or 'unknown'
 */

$replace = array(
    'integ-style' => calcForm('/assets/style.css'),
    'integ-script' => calcForm('/assets/script.min.js'),
    'answer' => '??',
    'eta' => '??',
    'startdate' => $showDate->format('c'),
    'showname' => GOAL_NAME,
    'body-class' => 'body ' . ($isPast ? 'body--after' : 'body--before')
);

if ($isPast) {
    $replace['answer'] = $lang->yes;
    $replace['eta'] = $lang->yes_eta;
} else {
    $_weeks = floor($showDiff->d / 7);
    $_days = $showDiff->d - $_weeks * 7;
    $_hours = $showDiff->h;
    $_mins = $showDiff->i;
    $_secs = $showDiff->s;

    $format = array();

    if ($_weeks > 1) {
        $format[] = sprintf('%s weken', $_weeks);
    } elseif ($_weeks == 1) {
        $format[] = '1 week';
    }

    if ($_days > 0) {
        $format[] = sprintf('%s dag%s', $_days, $_days > 1 ? 'en' : '');
    }

    $format[] = $showDiff->format('%H:%I:%S');

    $field = sprintf($lang->no_cont, implode(', ', $format));

    $replace['answer'] = $lang->no;
    $replace['eta'] = sprintf($lang->no_eta, $field);
}

foreach ($replace as $x => $y) {
    $x = sprintf('{{%s}}', $x);
    $html = str_replace($x, $y, $html);
}

$allowEnc = filter_input(INPUT_SERVER, 'HTTP_ACCEPT_ENCODING');
$hasGzip = preg_match('/(^|,)\s*gzip\s*($|,)/i', $allowEnc ? $allowEnc : '');

if ($hasGzip) {
    $html = gzencode($html, 9);
    header('Content-Encoding: gzip');
}

$expire = !$isPast ? $showDate->getOffset() : time() + 3600*24;

header(sprintf('Expires: %s', date('r', $expire)));
header(sprintf('Last-Modified: %s', date('r', $lastModified)));

header('Cache-Control: max-age=7200, public, must-revalidate');

header('Content-Type: text/html; charset=utf-8');
header(sprintf('Content-Length: %d', strlen($html)));

http_response_code(200);

echo $html;
