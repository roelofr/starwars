<?php

/**
 * Calculates a file checksum
 *
 * @param string $file
 * @return string
 */
function calcForm($file)
{
    if ($file[0] == '/') {
        $file = __DIR__ . $file;
    }

    if (!file_exists($file) || !is_file($file)) {
        return "unknown";
    }

    $hash = hash_file('sha384', $file, true);

    return sprintf('sha384-%s', base64_encode($hash));
}
