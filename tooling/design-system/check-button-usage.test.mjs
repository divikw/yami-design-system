import assert from "node:assert/strict";
import test from "node:test";
import { checkButtonUsage } from "./check-button-usage.mjs";

const imports = 'import { Button, ButtonLink, ButtonGroup } from "@yami/design-system";';
const check = (jsx) => checkButtonUsage(`${imports}\n${jsx}`);

test("mixed links and actions preserve their native semantics", () => {
  assert.equal(check('<article><a href="/orders/123">View order</a><Button onClick={generateReceipt}>Download receipt</Button></article>').pass, true);
  assert.equal(check('<a href="/receipts/123.pdf" download>Download receipt</a>').pass, true);
});

test("explicit Button navigation misuse is rejected, including aliases", () => {
  for (const jsx of [
    '<Button href="/orders">Orders</Button>', '<Button as="a">Orders</Button>', '<Button asChild><a href="/orders">Orders</a></Button>',
    '<Button onClick={() => { window.location.href = "/orders" }}>Orders</Button>',
    '<Button onClick={() => window.location.assign("/orders")}>Orders</Button>',
    '<Button onClick={() => window.location.replace("/orders")}>Orders</Button>',
  ]) assert.equal(check(jsx).pass, false, jsx);
  assert.equal(checkButtonUsage('import { Button as Action } from "../Button"; <Action href="/orders"/>').pass, false);
  assert.equal(checkButtonUsage('import { Button } from "other-library"; <Button href="/orders"/>').pass, true);
});

test("groups require a name and consistent statically known sizes", () => {
  for (const jsx of [
    '<ButtonGroup><Button>Save</Button></ButtonGroup>',
    '<ButtonGroup aria-label=" "><Button>Save</Button></ButtonGroup>',
    '<ButtonGroup aria-label="Actions"><Button size="sm"/><Button size="lg"/></ButtonGroup>',
    '<ButtonGroup aria-label="Actions"><Button/><Button size="lg"/></ButtonGroup>',
    '<ButtonGroup aria-label="Actions"><ButtonLink href="/orders" size="sm"/><Button size="md"/></ButtonGroup>',
  ]) assert.equal(check(jsx).pass, false, jsx);
  assert.equal(check('<ButtonGroup aria-label="Actions"><Button/><Button size="md"/></ButtonGroup>').pass, true);
  assert.equal(check('<ButtonGroup aria-label="Actions"><ButtonLink href="/orders"/><Button size="md"/></ButtonGroup>').pass, true);
  assert.equal(checkButtonUsage('import { ButtonLink as Link } from "../Button/ButtonLink"; import { Button, ButtonGroup } from "../ButtonGroup"; <ButtonGroup aria-label="Actions"><Link href="/orders" size="sm"/><Button/></ButtonGroup>').pass, false);
});

test("dynamic props and callbacks are left for type and runtime checks", () => {
  assert.equal(check('<ButtonGroup {...args}><Button size={size}/><Button size="md"/></ButtonGroup>').pass, true);
  assert.equal(check('<Button onClick={onAction}>Save</Button>').pass, true);
  assert.equal(check('<Button onClick={() => openDialog()}>Open</Button>').pass, true);
  assert.equal(check('<Button onClick={async () => { await placeOrder(); window.location.assign("/confirmation"); }}>Place order</Button>').pass, true);
});
