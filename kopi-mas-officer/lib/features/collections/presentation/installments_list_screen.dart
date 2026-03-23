import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:kopi_mas_officer/features/installments/providers/installments_provider.dart';
import 'package:kopi_mas_officer/features/installments/models/installment_model.dart';

final _installmentStatusFilterProvider = StateProvider.autoDispose<String>((ref) => 'all');

class InstallmentsListScreen extends ConsumerWidget {
  const InstallmentsListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statusFilter = ref.watch(_installmentStatusFilterProvider);
    final installmentsAsync = ref.watch(installmentsNotifierProvider);
    final statsAsync = ref.watch(installmentStatsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Installments'),
        scrolledUnderElevation: 0,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(24),
            child: statsAsync.when(
              data: (stats) => _StatsCard(stats: stats),
              loading: () => const SizedBox(height: 100),
              error: (_, __) => const SizedBox.shrink(),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: _StatusFilterChips(
              selected: statusFilter,
              onChanged: (v) => ref.read(_installmentStatusFilterProvider.notifier).state = v,
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: installmentsAsync.when(
              data: (installments) {
                final filteredInstallments = installments.where((i) {
                  if (statusFilter == 'all') return true;
                  return i.installmentStatus.toLowerCase() == statusFilter;
                }).toList();

                if (installments.isEmpty) {
                  return const _EmptyState(
                    title: 'No Installments',
                    message: 'Installments will appear here once loans are disbursed.',
                    icon: Icons.calendar_month_outlined,
                  );
                }

                if (filteredInstallments.isEmpty) {
                  return const _EmptyState(
                    title: 'No Results',
                    message: 'No installments match the selected filter.',
                    icon: Icons.filter_alt_off_rounded,
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async => ref.read(installmentsNotifierProvider.notifier).fetchInstallments(),
                  backgroundColor: Colors.white,
                  color: Theme.of(context).colorScheme.primary,
                  child: ListView.separated(
                    physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                    padding: const EdgeInsets.fromLTRB(24, 8, 24, 100),
                    itemCount: filteredInstallments.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 16),
                    itemBuilder: (context, index) => _InstallmentCard(installment: filteredInstallments[index]),
                  ),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => _ErrorState(error: e.toString(), onRetry: () => ref.invalidate(installmentsNotifierProvider)),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatsCard extends StatelessWidget {
  final InstallmentStats stats;

  const _StatsCard({required this.stats});

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Row(
        children: [
          Expanded(
            child: _StatItem(
              label: 'Pending',
              value: stats.pendingCount.toString(),
              color: Colors.amber,
            ),
          ),
          Container(width: 1, height: 40, color: Colors.grey.shade200),
          Expanded(
            child: _StatItem(
              label: 'Paid',
              value: stats.paidCount.toString(),
              color: Colors.green,
            ),
          ),
          Container(width: 1, height: 40, color: Colors.grey.shade200),
          Expanded(
            child: _StatItem(
              label: 'Overdue',
              value: stats.overdueCount.toString(),
              color: Colors.red,
            ),
          ),
        ],
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _StatItem({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: color),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(fontSize: 12, color: Colors.grey.shade600, fontWeight: FontWeight.w500),
        ),
      ],
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
          _FilterChip(label: 'Pending', value: 'pending', selected: selected, onTap: () => onChanged('pending')),
          const SizedBox(width: 8),
          _FilterChip(label: 'Paid', value: 'paid', selected: selected, onTap: () => onChanged('paid')),
          const SizedBox(width: 8),
          _FilterChip(label: 'Overdue', value: 'overdue', selected: selected, onTap: () => onChanged('overdue')),
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
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? Theme.of(context).colorScheme.primary : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isSelected ? Theme.of(context).colorScheme.primary : Colors.grey.shade300),
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

class _InstallmentCard extends StatelessWidget {
  final InstallmentModel installment;

  const _InstallmentCard({required this.installment});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final currencyFormat = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {},
          borderRadius: BorderRadius.circular(24),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 24,
                      backgroundColor: colorScheme.primary.withOpacity(0.1),
                      child: Text(
                        '#${installment.installmentNumber}',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: colorScheme.primary,
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Installment #${installment.installmentNumber}',
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'App: ${installment.applicationId ?? "N/A"}',
                            style: TextStyle(fontSize: 12, color: Colors.grey.shade600, fontWeight: FontWeight.w500),
                          ),
                        ],
                      ),
                    ),
                    _StatusBadge(status: installment.installmentStatus),
                  ],
                ),
                const SizedBox(height: 16),
                Divider(height: 1, color: Colors.grey.shade100),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Total Due', style: TextStyle(fontSize: 11, color: Colors.grey.shade500, fontWeight: FontWeight.w500)),
                        const SizedBox(height: 4),
                        Text(
                          currencyFormat.format(installment.totalAmount),
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                        ),
                      ],
                    ),
                    if (installment.paidAmount > 0)
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text('Paid', style: TextStyle(fontSize: 11, color: Colors.grey.shade500, fontWeight: FontWeight.w500)),
                          const SizedBox(height: 4),
                          Text(
                            currencyFormat.format(installment.paidAmount),
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.green.shade700),
                          ),
                        ],
                      ),
                  ],
                ),
                if (installment.dueDate != null) ...[
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Icon(Icons.calendar_today_rounded, size: 14, color: Colors.grey.shade500),
                      const SizedBox(width: 6),
                      Text(
                        'Due: ${DateFormat('dd MMM yyyy').format(DateTime.parse(installment.dueDate!))}',
                        style: TextStyle(fontSize: 12, color: _getDueDateColor(installment.dueDate!), fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ],
                if (installment.remainingAmount > 0) ...[
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.warning_rounded, size: 16, color: Colors.red.shade700),
                        const SizedBox(width: 8),
                        Text(
                          'Remaining: ${currencyFormat.format(installment.remainingAmount)}',
                          style: TextStyle(fontSize: 13, color: Colors.red.shade700, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Color _getDueDateColor(String? dueDateStr) {
    if (dueDateStr == null) return Colors.grey.shade600;
    final dueDate = DateTime.parse(dueDateStr);
    final now = DateTime.now();
    if (dueDate.isBefore(now)) return Colors.red.shade700;
    if (dueDate.difference(now).inDays <= 7) return Colors.amber.shade700;
    return Colors.grey.shade600;
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

    if (normalized == 'pending') {
      textColor = Colors.amber.shade800;
      bgColor = Colors.amber.shade50;
    } else if (normalized == 'paid' || normalized == 'completed') {
      textColor = Colors.green.shade700;
      bgColor = Colors.green.shade50;
    } else if (normalized == 'overdue') {
      textColor = Colors.red.shade700;
      bgColor = Colors.red.shade50;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(20)),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: textColor, letterSpacing: 0.5),
      ),
    );
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
