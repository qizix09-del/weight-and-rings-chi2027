"""Submission regressions against a production server, in an isolated Chrome context."""
import argparse
from datetime import datetime, timezone
from playwright.sync_api import sync_playwright, expect


def check_week(page, base):
    page.goto(base + '#/today',wait_until='domcontentloaded')
    button = lambda name: page.get_by_role('button', name=name, exact=True)
    load = page.locator('.load-chip')
    sessions = page.locator('.vessel-terrace')
    expect(load).to_have_text('68% · Balanced')
    for day, count in [('Tue 11', 2), ('Wed 12', 2), ('Thu 13', 2), ('Fri 14', 1)]:
        button(day).click()
        expect(sessions).to_have_count(count)
    button('Add a 15 min break').click()
    expect(sessions).to_have_count(2)
    page.reload(wait_until='domcontentloaded')
    expect(button('Fri 14')).to_have_attribute('aria-pressed', 'true')
    expect(sessions).to_have_count(2)
    button('Mon 10').click()
    expect(load).to_have_text('68% · Balanced')

    def add_row(id):
        button('Add session').click()
        page.get_by_role('dialog').get_by_role('button', name='Add '+id, exact=True).click()

    import json
    from pathlib import Path
    catalogue = json.loads((Path(__file__).resolve().parents[1] / 'src/data/chiSessions.json').read_text())
    titles = {row['id']:row['title'] for row in catalogue}
    add_row(titles['makers'])
    dialog = page.get_by_role('dialog')
    expect(dialog).to_contain_text('11:30–12:10')
    expect(dialog).to_contain_text(titles['time'])
    button('Save new to Slow Shelf').click()
    expect(button('Open '+titles['makers'])).to_be_visible()
    page.get_by_role('link', name='Vessel', exact=True).click()
    expect(load).to_have_text('68% · Balanced')
    add_row(titles['makers'])
    button('Swap into Today').click()
    expect(load).to_have_text('60% · Balanced')
    page.get_by_role('link', name='Saved', exact=True).click()
    expect(button('Open '+titles['time'])).to_be_visible()
    page.get_by_role('link', name='Vessel', exact=True).click()
    add_row(titles['caption'])
    add_row(titles['shared'])
    expect(load).to_have_text('Today is full · 100%')
    add_row(titles['field'])
    expect(button('Save for later')).to_be_visible()
    page.keyboard.press('Escape')
    button('Add a 15 min break').click()
    expect(load).to_have_text('88% · Full day')
    button('Remove break').click()
    expect(load).to_have_text('Today is full · 100%')
    print('Five day plans, persistence, both conflict actions, full-day protection and reversible breaks passed.')


def check_clock(page, base):
    for hour, minute, phase in [(5,29,'dusk'),(5,30,'dawn'),(9,0,'morning'),(11,30,'noon'),
                               (14,30,'afternoon'),(17,30,'dusk'),(20,45,'dusk'),(0,0,'dusk')]:
        page.clock.set_fixed_time(datetime(2027,5,10,hour,minute,tzinfo=timezone.utc))
        page.goto(base+'#/pause',wait_until='domcontentloaded')
        page.reload(wait_until='domcontentloaded')
        expect(page.locator('.phone')).to_have_attribute('data-sky',phase)
        expect(page.locator('.sky-disclosure summary')).to_contain_text(f'Local {hour:02d}:{minute:02d}')
    page.locator('.sky-disclosure summary').click()
    for phase in ['Dawn','Morning','Noon','Afternoon','Dusk']:
        page.get_by_role('button',name=phase,exact=True).click()
        expect(page.locator('.phone')).to_have_attribute('data-sky',phase.lower())
    page.get_by_role('button',name='Use automatic local time').click()
    expect(page.locator('.sky-disclosure summary')).to_contain_text('Local 00:00')
    print('All solar boundaries, evening, midnight, preview and reset passed.')


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--url',default='http://127.0.0.1:4327/')
    base=parser.parse_args().url.rstrip('/')+'/'
    with sync_playwright() as pw:
        browser=pw.chromium.launch(channel='chrome')
        page=browser.new_page(viewport={'width':390,'height':844},timezone_id='UTC')
        errors=[]
        page.on('pageerror',lambda error:errors.append(str(error)))
        for route,heading in [('today','Today'),('rings','Physical & Tangible Visualizations'),('pause','Take a break'),('saved','Slow Shelf'),('list','Schedule')]:
            page.goto(base+'#/'+route,wait_until='domcontentloaded')
            page.reload(wait_until='domcontentloaded')
            expect(page.get_by_role('heading',name=heading,exact=True)).to_be_visible()
        check_week(page,base)
        check_clock(page,base)
        assert not errors, errors
        browser.close()

