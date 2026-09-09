import assert from "node:assert/strict";
import test from "node:test";
import { evaluate, parse } from "groq-js";
import {
  isPrivateDocumentId,
  privateDocumentId,
  privateDocumentQuery,
} from "../src/lib/private-documents";
import { getPublishable } from "../src/lib/submission";

test("every identity, token and order ID uses a private random-ID subpath", () => {
  const ids = new Set<string>();
  for (const type of [
    "user",
    "account",
    "verificationToken",
    "passwordResetToken",
    "order",
  ] as const) {
    const id = privateDocumentId(type);
    assert.ok(id.startsWith(`mkdirsPrivate.${type}.`));
    assert.ok(isPrivateDocumentId(id));
    assert.ok(!ids.has(id));
    ids.add(id);
  }
  for (const id of [
    "user-public",
    "drafts.user",
    "mkdirsPrivate.user.person@example.test",
  ])
    assert.equal(isPrivateDocumentId(id), false);
});

test("private lookups use parameters and cannot fall back to public-root credentials", async () => {
  const id = privateDocumentId("user");
  const query = privateDocumentQuery("user", ["email"]);
  const data = [
    { _id: "public-user", _type: "user", email: "test@example.test" },
    { _id: id, _type: "user", email: "test@example.test" },
  ];
  const run = async (email: string) =>
    (
      await evaluate(parse(query), {
        dataset: data,
        params: { value_email: email },
      })
    ).get();
  assert.equal((await run("test@example.test"))._id, id);
  assert.equal(await run('" || true || "'), null);
  assert.throws(() => privateDocumentQuery("user", ["password || true"]));
});

test("publish eligibility follows the original reviewed or paid-plan state contract", () => {
  for (const freePlanStatus of [
    "submitting",
    "pending",
    "rejected",
    undefined,
  ]) {
    assert.equal(getPublishable({ pricePlan: "free", freePlanStatus }), false);
  }
  assert.equal(
    getPublishable({ pricePlan: "free", freePlanStatus: "approved" }),
    true,
  );
  for (const status of ["submitting", "pending", "failed", undefined]) {
    assert.equal(
      getPublishable({ pricePlan: "pro", proPlanStatus: status }),
      false,
    );
    assert.equal(
      getPublishable({ pricePlan: "sponsor", sponsorPlanStatus: status }),
      false,
    );
  }
  assert.equal(
    getPublishable({ pricePlan: "pro", proPlanStatus: "success" }),
    true,
  );
  assert.equal(
    getPublishable({ pricePlan: "sponsor", sponsorPlanStatus: "success" }),
    true,
  );
  assert.equal(getPublishable({ pricePlan: "unknown" }), false);
});
