#!/usr/bin/env python3
"""Read-only verification of the shipped Chinese against a pinned primary transcription.

Usage: python3 scripts/verify-iching-chinese.py [--cache /tmp/kaabalah-zhouyi-source]
The cache is optional. Downloads are Chinese only; no translated modern texts are used.
"""
import argparse
import concurrent.futures
import json
import pathlib
import re
import urllib.request

REVISION = '8284adbf9e3435d713180e24f05bf75f8b7d1d96'
ROOT = pathlib.Path(__file__).resolve().parent.parent


def extract(source):
    source = re.sub(r'^#.*$|^\*\*.*$|<pb:[^>]+>|¶', '', source, flags=re.M)
    name = re.search(r'《([^》]+)》', source).group(1)
    source = source[source.index('《' + name + '》'):]
    boundary = r'《彖》曰[：:]|《象》曰[：:]|(?:初[九六]|[九六][二三四五]|上[九六]|用[九六])[：、:]'
    marks = list(re.finditer(r'(?m)^(?:' + boundary + r')', source))
    clean = lambda text: re.sub(r'\s+', '', text).replace('《', '').replace('》', '')
    judgment = clean(source[:marks[0].start()])
    # 艮 in 艮其背 is a verb as well as the title, and must stay in the judgment.
    if name != '艮':
        judgment = judgment.removeprefix(name)
    result = {'judgment': judgment, 'image': None, 'lines': []}
    for i, mark in enumerate(marks):
        text = clean(source[mark.end():marks[i + 1].start() if i + 1 < len(marks) else len(source)])
        if mark.group().startswith('《象》') and result['image'] is None:
            result['image'] = text.split('「')[0]
        elif re.match(r'初|[九六][二三四五]|上', mark.group()):
            result['lines'].append(text)
        elif mark.group().startswith('用'):
            result['useNine' if mark.group().startswith('用九') else 'useSix'] = text
    assert len(result['lines']) == 6 and result['image']
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--cache', type=pathlib.Path)
    args = parser.parse_args()
    shipped = json.loads((ROOT / 'src/iching/hexagrams.json').read_text())

    def verify(row):
        number = row['number']
        cache = args.cache / f'{number:03}.txt' if args.cache else None
        if cache and cache.exists():
            source = cache.read_text()
        else:
            url = f'https://raw.githubusercontent.com/kanripo/KR1a0001/{REVISION}/KR1a0001_{number:03}.txt'
            source = urllib.request.urlopen(url, timeout=30).read().decode()
        expected = extract(source)
        actual = {key: ([text['chinese'] for text in value] if key == 'lines' else value['chinese']) for key, value in row['text'].items()}
        assert actual == expected, f'Chinese source mismatch: hexagram {number}'

    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        list(executor.map(verify, shipped))
    print('Verified 64 judgments, 64 Great Images, 384 lines and 用九/用六 against KR1a0001@' + REVISION)


if __name__ == '__main__':
    main()
