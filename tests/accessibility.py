"""Keyboard and reflow checks against a running production preview, using an isolated Chrome profile."""
import argparse
import tempfile
from playwright.sync_api import expect, sync_playwright


def tab_to(page, target, backwards=False):
    """Navigate with real keys. A failed focus path must fail the test, too."""
    key = 'Shift+Tab' if backwards else 'Tab'
    for _ in range(120):
        if target.count() == 1 and target.evaluate('el => el === document.activeElement'):
            return
        page.keyboard.press(key)
    raise AssertionError(f'Unreachable using {key}: {target}')


def keyboard_journeys(page, url):
    def btn(name):
        return page.get_by_role('button', name=name, exact=True)

    def activate(control, backwards=False):
        tab_to(page, control, backwards)
        page.keyboard.press('Enter')

    physical = 'Physical & Tangible Visualizations'
    page.goto(url + '#vessel')
    sky = page.locator('.sky-disclosure summary')
    activate(sky)
    slider = page.get_by_role('slider', name='Preview local time')
    tab_to(page,slider)
    page.keyboard.press('End')
    expect(page.locator('.phone')).to_have_attribute('data-sky','dusk')
    page.keyboard.press('Escape')
    expect(sky).to_be_focused()
    expect(slider).not_to_be_visible()
    add = btn('Add session')
    activate(add)
    expect(page.get_by_role('dialog')).to_be_visible()
    page.keyboard.press('Escape')
    expect(add).to_be_focused()
    page.keyboard.press('Enter')
    extra = 'Captions Around the Table'
    activate(btn('Add ' + extra))
    expect(page.locator('.load-chip')).to_have_text('90% · Full day')
    expect(btn('Preview ' + extra)).to_have_attribute('aria-pressed', 'true')
    expect(page.locator('.vessel-terrace')).to_have_count(4)
    activate(btn('Remove ' + extra + ' from Today'))
    expect(add).to_be_focused()
    expect(btn('Preview ' + extra)).to_have_count(0)
    expect(page.locator('.load-chip')).to_have_text('68% · Balanced')
    activate(btn('Add a 15 min break'))
    expect(page.locator('.load-chip')).to_have_text('56% · Balanced')
    expect(page.locator('.vessel-terrace[data-material=break]')).to_have_count(1)
    activate(btn('Remove break'))
    expect(btn('Add a 15 min break')).to_be_focused()
    expect(page.locator('.load-chip')).to_have_text('68% · Balanced')
    terrace = btn('Preview ' + physical)
    tab_to(page,terrace)
    page.keyboard.press('Space')
    expect(terrace).to_have_attribute('aria-pressed', 'true')
    activate(terrace)
    expect(terrace).to_have_attribute('aria-pressed', 'true')
    activate(btn('Explore rings'))
    activate(btn('2024'))
    expect(page.locator('.record-card')).to_contain_text('Sander Dullaert')
    page.keyboard.press('ArrowRight')
    expect(btn('2025')).to_be_focused()
    expect(page.locator('.record-card')).to_contain_text('No linked CHI record')
    page.keyboard.press('ArrowRight')
    expect(btn('2026')).to_have_attribute('aria-pressed', 'true')
    page.keyboard.press('Shift+Tab')
    expect(btn('2025')).to_be_focused()
    page.keyboard.press('Space')
    expect(btn('2025')).to_have_attribute('aria-pressed', 'true')
    activate(btn('Save for later'))
    expect(page.get_by_role('heading', name='Slow Shelf')).to_be_visible()
    expect(btn('Open ' + physical)).to_be_visible()
    activate(page.get_by_role('link', name='List', exact=True))
    expect(page.locator('.load-chip')).to_have_text('42% · Balanced')
    assert not page.evaluate('document.getAnimations().length')
    activate(btn('Explore (12)'))
    search = page.get_by_role('searchbox', name='Search sessions')
    tab_to(page, search)
    page.keyboard.type('captions')
    tab_to(page, page.get_by_role('radio', name='All', exact=True))
    page.keyboard.press('ArrowRight')
    expect(page.get_by_role('radio', name='Paper', exact=True)).to_be_checked()
    expect(page.locator('.static-sessions li')).to_have_count(1)
    title = 'Captions Around the Table'
    row = page.locator('.row-toggle').filter(has_text=title)
    activate(row)
    expect(row).to_have_attribute('aria-expanded','true')
    activate(btn('Add to Today · ' + title))
    expect(btn('Today (3)')).to_be_visible()
    inspect = btn('Inspect Rings · ' + title)
    activate(inspect)
    dialog = page.get_by_role('dialog')
    expect(dialog.get_by_role('heading', name='15-second session preview')).to_be_visible()
    tab_to(page,dialog.get_by_role('radio',name='2027'))
    page.keyboard.press('ArrowLeft')
    page.keyboard.press('ArrowLeft')
    expect(dialog.get_by_role('radio',name='2025')).to_be_checked()
    expect(dialog.locator('.record-card')).to_contain_text('SpeechCompass')
    page.keyboard.press('Escape')
    expect(inspect).to_be_focused()
    page.keyboard.press('Enter')
    activate(dialog.get_by_role('button', name='Save to Slow Shelf', exact=True))
    expect(btn('Today (2)')).to_be_visible()
    expect(inspect).to_be_focused()
    activate(btn('Today (2)'), backwards=True)
    activate(btn('+ Break'))
    breaks = page.get_by_role('combobox', name='Choose a break')
    tab_to(page,breaks)
    page.keyboard.press('s')
    expect(breaks).to_have_value('quiet-space')
    activate(btn('Add a 20 min break'))
    expect(page.locator('.load-chip')).to_have_text('30% · Balanced')
    expect(btn('+ Break')).to_be_focused()
    activate(page.locator('.row-toggle').filter(has_text='Sensory Landing'))
    activate(btn('Remove · Sensory Landing'))
    expect(btn('Today (2)')).to_be_focused()
    expect(page.locator('.load-chip')).to_have_text('42% · Balanced')
    activate(page.get_by_text('Demo settings', exact=True))
    time_slider = page.get_by_role('slider', name='Preview local time')
    tab_to(page,time_slider)
    page.keyboard.press('Home')
    expect(page.locator('.phone')).to_have_attribute('data-sky','dawn')
    page.keyboard.press('End')
    expect(page.locator('.phone')).to_have_attribute('data-sky','dusk')
    activate(btn('Reset Demo Data'))
    expect(page.locator('.load-chip')).to_have_text('68% · Balanced')
    expect(btn('Use automatic local time')).to_have_attribute('aria-pressed', 'true')
    expect(page.locator('.static-sessions li')).to_have_count(3)
    # Saving a planned item from its modal removes its trigger from the DOM.
    activate(btn('Inspect Rings · '+physical), backwards=True)
    activate(page.get_by_role('dialog').get_by_role('button', name='Save to Slow Shelf', exact=True))
    expect(btn('Today (2)')).to_be_focused()


REFLOW = """() => {
  const issues=[];
  const rect=e=>e.getBoundingClientRect();
  const selectors='.phone,.screen,.list-panel,.list-filters,.list-row-actions,.list-switch,.timeline-card,.rings-reading,.record-card,.reading-header,.rings-footer,.shelf-reading,.archive-card,.dock,.load-row,.screen-heading,.sheet-surface';
  for (const e of document.querySelectorAll(selectors)) {
    if (e.clientWidth && e.scrollWidth>e.clientWidth+2) issues.push(e.className+' horizontally overflows');
  }
  const overlap=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>1 && Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1;
  for (const group of ['.dock-caption','.dial-year','.reading-header > *','.load-row > *','.list-switch button','.shelf-intro > *','.screen-heading > *']) {
    const boxes=Array.from(document.querySelectorAll(group)).map(rect).filter(r=>r.width>0);
    boxes.forEach((r,i)=>{if(boxes.slice(i+1).some(s=>overlap(r,s))) issues.push(group+' overlaps')});
    const phone=rect(document.querySelector('.phone'));
    if(boxes.some(r=>r.left<phone.left-1||r.right>phone.right+1)) issues.push(group+' clipped horizontally');
  }
  const dock=document.querySelector('.dock');
  if(dock && [...dock.querySelectorAll('a span')].some(e=>rect(e).bottom>innerHeight+1 || rect(e).top<rect(dock).top-1)) issues.push('dock labels outside viewport');
  return issues;
}"""


def reflow_checks(page, url, label):
    for view in ('vessel','rings/physical/2024','saved','pause','list'):
        page.goto(url+'#'+view)
        if view == 'list':
            page.get_by_role('button',name='Explore (12)',exact=True).click()
        issues = page.evaluate(REFLOW)
        assert not issues, (label,view,issues)
        assert page.evaluate("document.getAnimations().filter(a=>a.playState==='running').length")==0, (label, view, 'motion')
        if view == 'list':
            page.get_by_role('button',name='Inspect Rings · Physical & Tangible Visualizations').click()
            expect(page.get_by_role('dialog')).to_be_visible()
            assert not page.evaluate(REFLOW),(label,'text reader')
            assert not page.evaluate('document.getAnimations().length')
            page.keyboard.press('Escape')
    print('Passed reflow and reduced motion:',label,flush=True)


def main():
    args = argparse.ArgumentParser()
    args.add_argument('--url', default='http://127.0.0.1:4327/today')
    url = args.parse_args().url.split('#')[0]
    with sync_playwright() as pw, tempfile.TemporaryDirectory() as profile:
        browser = pw.chromium.launch_persistent_context(profile,channel='chrome',no_viewport=True,args=['--window-size=1280,900'])
        page=browser.pages[0]
        page.set_default_timeout(4500)
        errors=[]
        page.on('pageerror',lambda error: errors.append(str(error)))
        keyboard_journeys(page,url)
        print('Passed both keyboard journeys.',flush=True)
        page.goto(url+'#vessel')
        expect(page.locator('.water-light')).to_be_visible()
        page.wait_for_function("document.querySelector('.water-light').getAnimations().length>0")
        page.emulate_media(reduced_motion='reduce')
        page.wait_for_function("document.getAnimations().length===0")
        prefs=browser.new_page()
        prefs.goto('chrome://settings/appearance')
        base_ratio=page.evaluate('devicePixelRatio')
        for factor in (1.5,2):
            prefs.evaluate('s=>new Promise(done=>chrome.settingsPrivate.setDefaultZoom(s,done))',factor)
            page.wait_for_function('r=>Math.abs(devicePixelRatio-r)<0.02',arg=base_ratio*factor)
            reflow_checks(page,url,f'{factor*100:.0f}% browser zoom')
        prefs.evaluate('()=>new Promise(done=>chrome.settingsPrivate.setDefaultZoom(1,done))')
        prefs.close()
        page.set_viewport_size({'width':320,'height':568})
        for percent in (150,200):
            page.goto(url)
            page.evaluate("v=>document.documentElement.style.fontSize=v",f'{percent}%')
            expect(page.locator('html')).to_have_css('font-size',str(int(16*percent/100))+'px')
            expect(page.get_by_role('heading',name='Schedule',exact=True)).to_be_visible()
            reflow_checks(page,url,f'320px and {percent}% text')
        assert not errors,errors
        browser.close()


if __name__ == '__main__':
    main()
