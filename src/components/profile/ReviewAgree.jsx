<div style={styles.termsSection}>
  <div style={styles.termsText}>
    This platform is powered by <strong>Enabled HR Labs Inc.</strong>
  </div>

  <div style={styles.termsText}>
    To help match you with the right employers, Enabled HR Labs Inc. collects your profile information, including your skills and any accessibility needs you choose to share. All your data is handled securely, as explained in our{" "}
    <a href="/privacy-policy" style={{ color: "#c8a45c", textDecoration: "underline" }}>
      Privacy Policy
    </a>{" "}
    and{" "}
    <a href="/terms-of-service" style={{ color: "#c8a45c", textDecoration: "underline" }}>
      Terms of Service
    </a>.
  </div>

  <div style={styles.termsText}>
    Most importantly, your information will never be shared with an employer without your direct permission. You are always in control. You can withdraw your consent at any time by contacting us at{" "}
    <a href="mailto:support@enabledtalent.ca" style={{ color: "#c8a45c", textDecoration: "underline" }}>
      support@enabledtalent.ca
    </a>.
  </div>

  <div style={styles.checkboxWrapper}>
    <input
      type="checkbox"
      id="agree-checkbox"
      style={styles.checkbox}
      checked={reviewAgree.agreed}
      onChange={(e) => updateField("agreed", e.target.checked)}
    />
    <label htmlFor="agree-checkbox" style={styles.checkboxLabel}>
      ☐ I have read the Privacy Policy and Terms of Service, and I agree to let Enabled HR Labs Inc. collect and use my personal information as described to support my job search.{" "}
      <span style={{ color: "#ef4444" }}>*</span>
    </label>
  </div>

  {errors.agreed && (
    <div style={styles.errorText}>{errors.agreed}</div>
  )}
</div>
