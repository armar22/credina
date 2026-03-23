import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:kopi_mas_officer/features/loans/providers/loans_provider.dart';
import 'package:kopi_mas_officer/core/theme/app_theme.dart';
import 'package:kopi_mas_officer/shared/widgets/common_widgets.dart';

final _loanStatusFilterProvider = StateProvider.autoDispose<String>((ref) => 'all');

class LoanListScreen extends ConsumerWidget {
  const LoanListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statusFilter = ref.watch(_loanStatusFilterProvider);
    final loansAsync = ref.watch(loanApplicationsNotifierProvider);
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      backgroundColor: AppTheme.surfaceColor,
      body: Column(
        children: [
          HeroHeader(
            title: 'Loan Applications',
            subtitle: 'Track and manage loan requests',
            trailing: IconButton(
              onPressed: () => context.push('/loans/create'),
              icon: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.add_rounded, color: Colors.white, size: 20),
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
            color: AppTheme.surfaceColor,
            child: _StatusFilterChips(
              selected: statusFilter,
              onChanged: (v) => ref.read(_loanStatusFilterProvider.notifier).state = v,
            ),
          ),
          Expanded(
            child: loansAsync.when(
              data: (loans) {
                final filteredLoans = loans.where((l) {
                  if (statusFilter == 'all') return true;
                  return l.applicationStatus.toLowerCase() == statusFilter;
                }).toList();

                if (loans.isEmpty) {
                  return const _EmptyState(
                    title: 'No Loan Applications',
                    message: 'Loan applications from members will appear here.',
                    icon: Icons.account_balance_wallet_outlined,
                  );
                }

                if (filteredLoans.isEmpty) {
                  return const _EmptyState(
                    title: 'No Results',
                    message: 'No loans match the selected filter.',
                    icon: Icons.filter_alt_off_rounded,
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async => ref.read(loanApplicationsNotifierProvider.notifier).loadLoanApplications(),
                  backgroundColor: Colors.white,
                  color: Theme.of(context).colorScheme.primary,
                  child: ListView.separated(
                    physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                    padding: const EdgeInsets.fromLTRB(20, 8, 20, 100),
                    itemCount: filteredLoans.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 16),
                    itemBuilder: (context, index) => _LoanCard(loan: filteredLoans[index]),
                  ),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => _ErrorState(error: e.toString(), onRetry: () => ref.invalidate(loanApplicationsNotifierProvider)),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusFilterChips extends StatelessWidget {
  final String selected;
  final ValueChanged<String> onChanged;

  const _StatusFilterChips({required this.selected, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _FilterChip(label: 'All', value: 'all', selected: selected, onTap: () => onChanged('all')),
          const SizedBox(width: 8),
          _FilterChip(label: 'Submitted', value: 'submitted', selected: selected, onTap: () => onChanged('submitted')),
          const SizedBox(width: 8),
          _FilterChip(label: 'Under Review', value: 'under_review', selected: selected, onTap: () => onChanged('under_review')),
          const SizedBox(width: 8),
          _FilterChip(label: 'Approved', value: 'approved', selected: selected, onTap: () => onChanged('approved')),
          const SizedBox(width: 8),
          _FilterChip(label: 'Rejected', value: 'rejected', selected: selected, onTap: () => onChanged('rejected')),
          const SizedBox(width: 8),
          _FilterChip(label: 'Disbursed', value: 'disbursed', selected: selected, onTap: () => onChanged('disbursed')),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final String value;
  final String selected;
  final VoidCallback onTap;

  const _FilterChip({required this.label, required this.value, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isSelected = value == selected;
    final colorScheme = Theme.of(context).colorScheme;
    
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? colorScheme.primary : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? colorScheme.primary : Colors.grey.shade200,
            width: isSelected ? 1.5 : 1,
          ),
          boxShadow: isSelected ? [
            BoxShadow(
              color: colorScheme.primary.withOpacity(0.2),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ] : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: isSelected ? Colors.white : Colors.grey.shade700,
          ),
        ),
      ),
    );
  }
}

class _LoanCard extends StatelessWidget {
  final LoanApplicationModel loan;

  const _LoanCard({required this.loan});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final currencyFormat = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);

    return Container(
      decoration: AppTheme.elevatedCardDecoration(),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => context.go('/loans/${loan.id}'),
          borderRadius: BorderRadius.circular(24),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        color: colorScheme.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Icon(Icons.account_balance_wallet_rounded, color: colorScheme.primary, size: 26),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            currencyFormat.format(loan.loanAmount),
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w800,
                              letterSpacing: -0.5,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              Icon(Icons.calendar_month_rounded, size: 14, color: Colors.grey.shade500),
                              const SizedBox(width: 4),
                              Text(
                                '${loan.loanTenureMonths} months',
                                style: TextStyle(
                                  fontSize: 13,
                                  color: Colors.grey.shade600,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                width: 4,
                                height: 4,
                                decoration: BoxDecoration(
                                  color: Colors.grey.shade300,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                loan.loanProductType ?? loan.loanProductTypeStr,
                                style: TextStyle(
                                  fontSize: 13,
                                  color: Colors.grey.shade600,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    _StatusBadge(status: loan.applicationStatus),
                  ],
                ),
                const SizedBox(height: 16),
                Container(
                  height: 1,
                  color: Colors.grey.shade100,
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: Colors.grey.shade50,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Icon(Icons.calendar_today_rounded, size: 14, color: Colors.grey.shade500),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Applied: ${DateFormat('dd MMM yyyy').format(loan.submittedAt)}',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade600,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.percent_rounded, size: 14, color: const Color(0xFF10B981)),
                          const SizedBox(width: 4),
                          Text(
                            '${loan.interestRate}%',
                            style: TextStyle(
                              fontSize: 12,
                              color: const Color(0xFF10B981),
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
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
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(20)),
      child: Text(
        _truncateStatus(status),
        style: TextStyle(
          fontSize: 10,
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
    if (formatted.length > 12) {
      return '${formatted.substring(0, 10)}...';
    }
    return formatted;
  }
}

class _EmptyState extends StatelessWidget {
  final String title;
  final String message;
  final IconData icon;

  const _EmptyState({required this.title, required this.message, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(color: Colors.grey.shade100, shape: BoxShape.circle),
              child: Icon(icon, size: 48, color: Colors.grey.shade400),
            ),
            const SizedBox(height: 24),
            Text(title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
            const SizedBox(height: 8),
            Text(message, textAlign: TextAlign.center, style: TextStyle(color: Colors.grey.shade600, fontSize: 14)),
          ],
        ),
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  final String error;
  final VoidCallback onRetry;

  const _ErrorState({required this.error, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.warning_rounded, size: 64, color: Colors.red.shade400),
            const SizedBox(height: 16),
            const Text('Something went wrong', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
            const SizedBox(height: 8),
            Text(error, textAlign: TextAlign.center, style: TextStyle(color: Colors.grey.shade600)),
            const SizedBox(height: 24),
            OutlinedButton.icon(onPressed: onRetry, icon: const Icon(Icons.refresh_rounded), label: const Text('Try Again')),
          ],
        ),
      ),
    );
  }
}