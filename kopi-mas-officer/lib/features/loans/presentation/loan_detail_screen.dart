import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:kopi_mas_officer/features/loans/providers/loans_provider.dart';
import 'package:kopi_mas_officer/core/theme/app_theme.dart';

class LoanDetailScreen extends ConsumerWidget {
  final String id;

  const LoanDetailScreen({super.key, required this.id});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colorScheme = Theme.of(context).colorScheme;
    final loanAsync = ref.watch(loanApplicationDetailProvider(id));
    final currencyFormat = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);

    return Scaffold(
      backgroundColor: AppTheme.surfaceColor,
      appBar: AppBar(
        title: const Text('Loan Details'),
        scrolledUnderElevation: 0,
        actions: [
          IconButton(
            icon: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(Icons.more_vert_rounded, size: 20),
            ),
            onPressed: () {},
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: loanAsync.when(
        data: (loan) {
          if (loan == null) return const _NotFoundState();

          return SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 120),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: colorScheme.primary.withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(Icons.account_balance_wallet_rounded, size: 44, color: colorScheme.primary),
                      ),
                      const SizedBox(height: 20),
                      Text(
                        currencyFormat.format(loan.loanAmount),
                        style: const TextStyle(
                          fontSize: 34,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -1,
                        ),
                      ),
                      const SizedBox(height: 12),
                      _StatusBadge(status: loan.applicationStatus),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
                _ModernInfoCard(
                  title: 'Loan Information',
                  icon: Icons.info_outline_rounded,
                  color: const Color(0xFF3B82F6),
                  children: [
                    _DetailRow(label: 'Loan Type', value: (loan.loanProductType ?? loan.loanProductTypeStr).toUpperCase()),
                    const _Divider(),
                    _DetailRow(label: 'Tenure', value: '${loan.loanTenureMonths} months'),
                    const _Divider(),
                    _DetailRow(label: 'Interest Rate', value: '${loan.interestRate}% (${loan.interestRateType})'),
                    const _Divider(),
                    _DetailRow(label: 'Purpose', value: loan.purposeDescription ?? 'Not specified'),
                  ],
                ),
                const SizedBox(height: 16),
                _ModernInfoCard(
                  title: 'Financial Profile',
                  icon: Icons.account_balance_rounded,
                  color: const Color(0xFFF59E0B),
                  children: [
                    _DetailRow(label: 'Monthly Income', value: currencyFormat.format(loan.monthlyIncome), valueColor: const Color(0xFF10B981)),
                    const _Divider(),
                    _DetailRow(label: 'Income Source', value: loan.incomeSource.toUpperCase()),
                    if (loan.debtToIncomeRatio != null) ...[
                      const _Divider(),
                      _DetailRow(label: 'Debt-to-Income Ratio', value: '${(loan.debtToIncomeRatio! * 100).toStringAsFixed(1)}%'),
                    ],
                  ],
                ),
                const SizedBox(height: 16),
                _ModernInfoCard(
                  title: 'Application Timeline',
                  icon: Icons.timeline_rounded,
                  color: const Color(0xFF10B981),
                  children: [
                    _DetailRow(label: 'Submitted', value: DateFormat('dd MMMM yyyy, HH:mm').format(loan.submittedAt)),
                    if (loan.reviewedAt != null) ...[
                      const _Divider(),
                      _DetailRow(label: 'Reviewed', value: DateFormat('dd MMMM yyyy, HH:mm').format(loan.reviewedAt!)),
                      if (loan.reviewedBy != null) _DetailRow(label: 'Reviewed By', value: loan.reviewedBy!),
                    ],
                    if (loan.approvedAt != null) ...[
                      const _Divider(),
                      _DetailRow(label: 'Approved', value: DateFormat('dd MMMM yyyy, HH:mm').format(loan.approvedAt!)),
                      if (loan.approvedBy != null) _DetailRow(label: 'Approved By', value: loan.approvedBy!),
                    ],
                  ],
                ),
                if (loan.rejectionReason != null) ...[
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEE2E2),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: const Color(0xFFFCA5A5)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.cancel_rounded, color: Colors.red.shade700),
                            const SizedBox(width: 12),
                            Text(
                              'Rejection Reason',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: Colors.red.shade700,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(loan.rejectionReason!, style: TextStyle(color: Colors.red.shade800)),
                      ],
                    ),
                  ),
                ],
                if (loan.creditScore != null) ...[
                  const SizedBox(height: 16),
                  _ModernInfoCard(
                    title: 'Credit Assessment',
                    icon: Icons.analytics_rounded,
                    color: const Color(0xFF8B5CF6),
                    children: [
                      _DetailRow(
                        label: 'Credit Score',
                        value: loan.creditScore.toString(),
                        valueColor: _getCreditScoreColor(loan.creditScore!),
                      ),
                      if (loan.aiRecommendation != null) ...[
                        const _Divider(),
                        _DetailRow(label: 'AI Recommendation', value: loan.aiRecommendation!),
                      ],
                    ],
                  ),
                ],
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      floatingActionButton: loanAsync.hasValue && loanAsync.value != null
          ? Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border(top: BorderSide(color: Colors.grey.shade200)),
              ),
              child: SafeArea(
                child: Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () {},
                        icon: const Icon(Icons.chat_rounded),
                        label: const Text('Contact'),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          side: BorderSide(color: Colors.grey.shade300, width: 2),
                          foregroundColor: Colors.black87,
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: FilledButton.icon(
                        onPressed: () {},
                        icon: const Icon(Icons.document_scanner_rounded),
                        label: const Text('Documents'),
                      ),
                    ),
                  ],
                ),
              ),
            )
          : const SizedBox.shrink(),
    );
  }

  Color _getCreditScoreColor(int score) {
    if (score >= 700) return const Color(0xFF10B981);
    if (score >= 500) return const Color(0xFFF59E0B);
    return const Color(0xFFEF4444);
  }
}

class _StatusBadge extends StatelessWidget {
  final String status;

  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    final normalized = status.toLowerCase();
    Color textColor = Colors.grey.shade700;
    Color bgColor = Colors.grey.shade100;

    switch (normalized) {
      case 'submitted':
        textColor = const Color(0xFF3B82F6);
        bgColor = const Color(0xFFEFF6FF);
        break;
      case 'under_review':
        textColor = const Color(0xFFF59E0B);
        bgColor = const Color(0xFFFEF3C7);
        break;
      case 'approved':
      case 'disbursed':
        textColor = const Color(0xFF10B981);
        bgColor = const Color(0xFFECFDF5);
        break;
      case 'rejected':
        textColor = const Color(0xFFEF4444);
        bgColor = const Color(0xFFFEE2E2);
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
      decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(100)),
      child: Text(
        _truncateStatus(status),
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w800,
          color: textColor,
          letterSpacing: 0.5,
        ),
        overflow: TextOverflow.ellipsis,
      ),
    );
  }

  String _truncateStatus(String status) {
    final formatted = status.replaceAll('_', ' ').toUpperCase();
    if (formatted.length > 14) {
      return '${formatted.substring(0, 12)}...';
    }
    return formatted;
  }
}

class _ModernInfoCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color color;
  final List<Widget> children;

  const _ModernInfoCard({
    required this.title,
    required this.icon,
    required this.color,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: AppTheme.elevatedCardDecoration(),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(icon, size: 20, color: color),
                ),
                const SizedBox(width: 16),
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            ...children,
          ],
        ),
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  final Color? valueColor;

  const _DetailRow({required this.label, required this.value, this.valueColor});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          flex: 2,
          child: Text(
            label,
            style: TextStyle(
              fontSize: 13,
              color: Colors.grey.shade500,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          flex: 3,
          child: Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: valueColor ?? Colors.black87,
            ),
            textAlign: TextAlign.right,
          ),
        ),
      ],
    );
  }
}

class _Divider extends StatelessWidget {
  const _Divider();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 12, bottom: 12),
      child: Divider(height: 1, color: Colors.grey.shade100),
    );
  }
}

class _NotFoundState extends StatelessWidget {
  const _NotFoundState();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.search_off_rounded, size: 48, color: Colors.grey.shade400),
          ),
          const SizedBox(height: 16),
          const Text('Loan Not Found', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
          const SizedBox(height: 24),
          FilledButton.icon(
            onPressed: () => context.go('/loans'),
            icon: const Icon(Icons.arrow_back_rounded),
            label: const Text('Back to Loans'),
          ),
        ],
      ),
    );
  }
}