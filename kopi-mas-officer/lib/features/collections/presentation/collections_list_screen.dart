import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:kopi_mas_officer/features/collections/providers/collections_provider.dart';
import 'package:kopi_mas_officer/features/collections/models/collection_model.dart';
import 'package:kopi_mas_officer/core/theme/app_theme.dart';
import 'package:kopi_mas_officer/shared/widgets/common_widgets.dart';

final _collectionStatusFilterProvider = StateProvider.autoDispose<String>((ref) => 'all');

class CollectionsListScreen extends ConsumerWidget {
  const CollectionsListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statusFilter = ref.watch(_collectionStatusFilterProvider);
    final collectionsAsync = ref.watch(collectionsNotifierProvider);
    final statsAsync = ref.watch(collectionStatsProvider);
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      backgroundColor: AppTheme.surfaceColor,
      body: Column(
        children: [
          HeroHeader(
            title: 'Collections',
            subtitle: 'Record and track member payments',
            trailing: IconButton(
              onPressed: () => context.push('/collections/history'),
              icon: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.history_rounded, color: Colors.white, size: 20),
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
            color: AppTheme.surfaceColor,
            child: Column(
              children: [
                statsAsync.when(
                  data: (stats) => _StatsCard(stats: stats),
                  loading: () => const SizedBox(height: 100),
                  error: (_, __) => const SizedBox.shrink(),
                ),
                const SizedBox(height: 12),
                _StatusFilterChips(
                  selected: statusFilter,
                  onChanged: (v) => ref.read(_collectionStatusFilterProvider.notifier).state = v,
                ),
              ],
            ),
          ),
          Expanded(
            child: collectionsAsync.when(
              data: (collections) {
                final filteredCollections = collections.where((c) {
                  if (statusFilter == 'all') return true;
                  return c.collectionStatus.toLowerCase() == statusFilter;
                }).toList();

                if (collections.isEmpty) {
                  return const _EmptyState(
                    title: 'No Collections',
                    message: 'Collections will appear here when members have payments due.',
                    icon: Icons.receipt_long_outlined,
                  );
                }

                if (filteredCollections.isEmpty) {
                  return const _EmptyState(
                    title: 'No Results',
                    message: 'No collections match the selected filter.',
                    icon: Icons.filter_alt_off_rounded,
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async => ref.read(collectionsNotifierProvider.notifier).fetchCollections(),
                  backgroundColor: Colors.white,
                  color: Theme.of(context).colorScheme.primary,
                  child: ListView.separated(
                    physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                    padding: const EdgeInsets.fromLTRB(20, 8, 20, 100),
                    itemCount: filteredCollections.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 16),
                    itemBuilder: (context, index) => _CollectionCard(collection: filteredCollections[index]),
                  ),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => _ErrorState(error: e.toString(), onRetry: () => ref.invalidate(collectionsNotifierProvider)),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatsCard extends StatelessWidget {
  final CollectionStats stats;

  const _StatsCard({required this.stats});

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.elevatedCardDecoration(),
      child: Row(
        children: [
          Expanded(
            child: _StatItem(
              label: 'Pending',
              value: stats.totalPending.toString(),
              subValue: 'payments',
              icon: Icons.pending_rounded,
              color: const Color(0xFFF59E0B),
            ),
          ),
          Container(width: 1, height: 40, color: Colors.grey.shade200),
          Expanded(
            child: _StatItem(
              label: 'Paid',
              value: stats.totalPaid.toString(),
              subValue: 'payments',
              icon: Icons.check_circle_rounded,
              color: const Color(0xFF10B981),
            ),
          ),
          Container(width: 1, height: 40, color: Colors.grey.shade200),
          Expanded(
            child: _StatItem(
              label: 'Overdue',
              value: stats.totalOverdue.toString(),
              subValue: 'payments',
              icon: Icons.warning_rounded,
              color: const Color(0xFFEF4444),
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
  final String subValue;
  final IconData icon;
  final Color color;

  const _StatItem({
    required this.label,
    required this.value,
    required this.subValue,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: color, size: 18),
        ),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w800,
          ),
          textAlign: TextAlign.center,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: 2),
        Text(
          subValue,
          style: TextStyle(
            fontSize: 10,
            color: Colors.grey.shade600,
            fontWeight: FontWeight.w500,
          ),
          textAlign: TextAlign.center,
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

class _CollectionCard extends StatelessWidget {
  final CollectionModel collection;

  const _CollectionCard({required this.collection});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final currencyFormat = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);

    return Container(
      decoration: AppTheme.elevatedCardDecoration(),
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
                    Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        color: colorScheme.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Icon(Icons.receipt_rounded, color: colorScheme.primary, size: 26),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            collection.memberName ?? 'Member ${collection.memberId}',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              Icon(Icons.tag_rounded, size: 14, color: Colors.grey.shade500),
                              const SizedBox(width: 4),
                              Flexible(
                                child: Text(
                                  'App: ${collection.applicationId?.substring(0, 8) ?? "N/A"}...',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey.shade600,
                                    fontWeight: FontWeight.w500,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    _StatusBadge(status: collection.collectionStatus),
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
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Amount Collected',
                          style: TextStyle(
                            fontSize: 11,
                            color: Colors.grey.shade500,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          currencyFormat.format(collection.paidAmount),
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF10B981),
                          ),
                        ),
                      ],
                    ),
                    if (collection.collectionStatus != null)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade100,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              collection.collectionStatus.toLowerCase() == 'paid'
                                  ? Icons.check_circle_rounded
                                  : collection.collectionStatus.toLowerCase() == 'overdue'
                                      ? Icons.warning_rounded
                                      : Icons.schedule_rounded,
                              size: 14,
                              color: Colors.grey.shade600,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              collection.collectionStatus.toUpperCase(),
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: Colors.grey.shade700,
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
                if (collection.paidDate != null) ...[
                  const SizedBox(height: 12),
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
                        DateFormat('dd MMM yyyy, HH:mm').format(collection.paidDate!),
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                ],
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

    if (normalized == 'pending') {
      textColor = const Color(0xFFF59E0B);
      bgColor = const Color(0xFFFEF3C7);
    } else if (normalized == 'completed' || normalized == 'paid') {
      textColor = const Color(0xFF10B981);
      bgColor = const Color(0xFFECFDF5);
    } else if (normalized == 'failed') {
      textColor = const Color(0xFFEF4444);
      bgColor = const Color(0xFFFEE2E2);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(20)),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w800,
          color: textColor,
          letterSpacing: 0.5,
        ),
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