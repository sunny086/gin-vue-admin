#!/usr/bin/env node
import path from 'node:path';
import fs from 'node:fs';
import { computeSyncId, parseCLIArgs } from './common.mjs';
import { scanProject } from './scan.mjs';
import { classifyProject } from './classify.mjs';
import { renderProject } from './render.mjs';
import { renderDeveloperProject } from './render_dev.mjs';

function buildSyncSnapshot(dataset) {
  return {
    stats: {
      total_files: dataset.stats.total_files,
      total_segments: dataset.stats.total_segments,
      total_lines: dataset.stats.total_lines,
    },
    files: dataset.files.map((f) => ({
      file_id: f.file_id,
      path: f.path,
      domain: f.domain,
      line_count: f.line_count,
    })),
    segments: dataset.segments.map((s) => ({
      segment_id: s.segment_id,
      file_id: s.file_id,
      start_line: s.start_line,
      end_line: s.end_line,
      kind: s.kind,
    })),
  };
}

function readManifestSync(manifestPath) {
  if (!fs.existsSync(manifestPath)) return null;
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

function main() {
  const args = parseCLIArgs(process.argv.slice(2));
  const options = {
    ...args,
    repoRoot: path.resolve(args.repoRoot),
  };

  const scanned = scanProject(options);
  const classified = classifyProject(scanned, options);
  const generatedAt = new Date().toISOString();
  const sourceStats = {
    total_files: classified.stats.total_files,
    total_segments: classified.stats.total_segments,
    total_lines: classified.stats.total_lines,
  };
  const syncId = computeSyncId(buildSyncSnapshot(classified));

  const machineResult = renderProject(classified, {
    ...options,
    generatedAt,
    sourceStats,
    syncId,
  });

  let devResult = null;
  if (!options.noDev) {
    devResult = renderDeveloperProject(classified, {
      ...options,
      generatedAt,
      sourceStats,
      syncId,
    });
    const machineManifest = readManifestSync(
      path.join(options.repoRoot, options.out, 'index', 'manifest.json')
    );
    const devManifest = readManifestSync(
      path.join(options.repoRoot, options.devOut, 'index', 'manifest.json')
    );
    if (!machineManifest || !devManifest || machineManifest.sync_id !== devManifest.sync_id) {
      throw new Error('sync_id mismatch between machine docs and developer docs');
    }
  }

  const report = {
    machine_output: options.out,
    developer_output: options.noDev ? null : options.devOut,
    files: machineResult.filesCount,
    segments: machineResult.segmentsCount,
    total_lines: classified.stats.total_lines,
    scope: options.scope,
    exclude: options.exclude,
    sync_id: syncId,
    top_domains: machineResult.topDomains,
    developer_docs: devResult?.docs || [],
  };

  console.log(JSON.stringify(report, null, 2));
}

main();
