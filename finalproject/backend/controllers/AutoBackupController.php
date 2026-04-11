<?php
// Auto Backup: Runs silently in the background. Throttled to run at most once every 4 hours.
// This ensures end-of-day sales are captured even if the manager never manually triggers one.

$backup_dir  = realpath(__DIR__ . '/../../database') . DIRECTORY_SEPARATOR . 'backups' . DIRECTORY_SEPARATOR;
$status_file = $backup_dir . 'last_backup_time.txt';

// Create the backups directory if it doesn't exist yet.
if (!is_dir($backup_dir)) {
    mkdir($backup_dir, 0777, true);
}

// Throttle Check: If a backup ran less than 4 hours ago, exit immediately — do nothing.
$four_hours = 4 * 60 * 60;
$last_run   = file_exists($status_file) ? intval(file_get_contents($status_file)) : 0;

if ((time() - $last_run) < $four_hours) {
    exit;
}

// Database credentials.
$db_host = "localhost";
$db_name = "updatedpos";
$db_user = "root";
$db_pass = "";

// Output file — named by date so each day keeps its own file.
// Each run within the same day simply overwrites the earlier backup with a more current one.
$output_file = $backup_dir . "auto_backup_" . date("Y-m-d") . ".sql";

// Use proc_open to capture mysqldump output directly and write it ourselves.
// This avoids Windows shell redirect (>) issues inside exec().
$mysqldump = "C:\\xampp\\mysql\\bin\\mysqldump.exe";

$cmd = escapeshellcmd($mysqldump)
     . " -h " . escapeshellarg($db_host)
     . " -u " . escapeshellarg($db_user)
     . " "    . escapeshellarg($db_name);

$descriptors = [
    0 => ["pipe", "r"],  // stdin
    1 => ["pipe", "w"],  // stdout — the full SQL dump
    2 => ["pipe", "w"],  // stderr — error output
];

$process = proc_open($cmd, $descriptors, $pipes);

if (is_resource($process)) {
    $sql_dump = stream_get_contents($pipes[1]);
    fclose($pipes[1]);
    fclose($pipes[2]);
    $exit_code = proc_close($process);

    // Write the dump and record the timestamp only if the command succeeded.
    if ($exit_code === 0 && !empty($sql_dump)) {
        file_put_contents($output_file, $sql_dump);
        file_put_contents($status_file, time()); // Record current Unix timestamp
    }
}

// Exit with no output — this is entirely invisible to the browser.
exit;
